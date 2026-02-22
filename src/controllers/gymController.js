const db = require('../config/db');

const getGym = async (req, res) => {
    const { user_id } = req.params;

    // Optional: Only allow the user to view their own gym
    if (req.user && req.user.id !== user_id) {
        return res.status(403).json({ error: 'Acceso denegado. No autorizado para ver este gimnasio.' });
    }

    try {
        const result = await db.query('SELECT * FROM gyms WHERE user_id = $1', [user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gimnasio no encontrado para el usuario dado.' });
        }

        res.json({
            message: 'Información del gimnasio obtenida exitosamente.',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error al obtener gimnasio:', err);
        res.status(500).json({ error: 'Error interno al obtener la información del gimnasio.' });
    }
};

const updateGym = async (req, res) => {
    const { user_id } = req.params;

    // Optional: Only allow the user to update their own gym
    if (req.user && req.user.id !== user_id) {
        return res.status(403).json({ error: 'Acceso denegado. No autorizado para actualizar este gimnasio.' });
    }

    const {
        name,
        nit_ruc,
        legal_representative,
        corporate_phone,
        currency,
        tax_name,
        tax_percentage,
        logo_url
    } = req.body;

    try {
        const query = `
            UPDATE gyms
            SET 
                name = COALESCE($1, name),
                nit_ruc = COALESCE($2, nit_ruc),
                legal_representative = COALESCE($3, legal_representative),
                corporate_phone = COALESCE($4, corporate_phone),
                currency = COALESCE($5, currency),
                tax_name = COALESCE($6, tax_name),
                tax_percentage = COALESCE($7, tax_percentage),
                logo_url = COALESCE($8, logo_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $9
            RETURNING *;
        `;
        const values = [
            name,
            nit_ruc,
            legal_representative,
            corporate_phone,
            currency,
            tax_name,
            tax_percentage,
            logo_url,
            user_id
        ];

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gimnasio no encontrado para el usuario dado.' });
        }

        res.json({
            message: 'Información del gimnasio actualizada exitosamente.',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error al actualizar gimnasio:', err);
        res.status(500).json({ error: 'Error interno al actualizar la información del gimnasio.' });
    }
};

module.exports = {
    getGym,
    updateGym
};
