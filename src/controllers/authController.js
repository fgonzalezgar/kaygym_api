const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_for_jwt_auth_123';

const registerTrial = async (req, res) => {
    const { full_name, email, password, phone_number, gym_name } = req.body;

    if (!full_name || !email || !password || !gym_name) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: full_name, email, password, gym_name' });
    }

    try {
        const existing = await db.query('SELECT id FROM trial_registrations WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO trial_registrations (full_name, email, password_hash, phone_number, gym_name, trial_end_date)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + interval '14 days')
            RETURNING id, full_name, email, gym_name, trial_start_date, trial_end_date;
        `;
        const values = [full_name, email, passwordHash, phone_number || null, gym_name];
        const result = await db.query(query, values);
        const newUser = result.rows[0];

        const gymQuery = `
            INSERT INTO gyms (user_id, name)
            VALUES ($1, $2)
            RETURNING id;
        `;
        const gymResult = await db.query(gymQuery, [newUser.id, gym_name]);
        const gymId = gymResult.rows[0].id;

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Registro de prueba exitoso.',
            token,
            data: { ...newUser, gym_id: gymId }
        });
    } catch (err) {
        console.error('Error al registrar prueba:', err);
        res.status(500).json({ error: 'Error interno del servidor al registrar la prueba.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: email, password' });
    }

    try {
        const result = await db.query('SELECT * FROM trial_registrations WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const gymResult = await db.query('SELECT id FROM gyms WHERE user_id = $1', [user.id]);
        const gymId = gymResult.rows.length > 0 ? gymResult.rows[0].id : null;

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            data: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                gym_id: gymId
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};

const trialStatus = async (req, res) => {
    const { email } = req.params;

    try {
        const result = await db.query('SELECT * FROM trial_registrations WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado.' });
        }

        const trial = result.rows[0];
        const now = new Date();
        const endDate = new Date(trial.trial_end_date);
        const isExpired = now > endDate;

        const timeDiff = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        res.json({
            data: {
                id: trial.id,
                email: trial.email,
                isExpired,
                daysRemaining: isExpired ? 0 : daysRemaining,
                trial_end_date: trial.trial_end_date
            }
        });
    } catch (err) {
        console.error('Error al consultar estado:', err);
        res.status(500).json({ error: 'Error interno al consultar el estado de la prueba' });
    }
};

module.exports = {
    registerTrial,
    login,
    trialStatus
};
