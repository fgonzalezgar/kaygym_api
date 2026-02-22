const request = require('supertest');
const app = require('../index');
const db = require('../db');

jest.mock('../db');

describe('Pruebas de la API de Registro de KayGym', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar mock antes de cada prueba
    });

    describe('POST /api/register-trial', () => {
        it('Debe retornar error 400 si faltan campos', async () => {
            const resp = await request(app).post('/api/register-trial').send({
                email: 'test@test.com'
            });
            expect(resp.status).toBe(400);
            expect(resp.body.error).toContain('Faltan campos obligatorios');
        });

        it('Debe retornar error 409 si el correo ya existe', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ id: '123' }] }); // Simula que ya existe

            const resp = await request(app).post('/api/register-trial').send({
                full_name: 'Test',
                email: 'test@test.com',
                gym_name: 'Gym Test'
            });
            expect(resp.status).toBe(409);
            expect(resp.body.error).toBe('El email ya está registrado.');
        });

        it('Debe registrar exitosamente', async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // Simula que NO existe
            db.query.mockResolvedValueOnce({
                rows: [{
                    id: '1',
                    full_name: 'Test',
                    email: 'test@test.com',
                    gym_name: 'Gym Test',
                    trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                }]
            }); // Simula insert

            const resp = await request(app).post('/api/register-trial').send({
                full_name: 'Test',
                email: 'test@test.com',
                gym_name: 'Gym Test'
            });
            expect(resp.status).toBe(201);
            expect(resp.body.message).toBe('Registro de prueba exitoso.');
            expect(resp.body.data.email).toBe('test@test.com');
        });
    });

    describe('GET /api/trial-status/:email', () => {
        it('Debe retornar 404 si el usuario no existe', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });

            const resp = await request(app).get('/api/trial-status/noexiste@test.com');
            expect(resp.status).toBe(404);
            expect(resp.body.error).toBe('Registro no encontrado.');
        });

        it('Debe retornar datos del estado de prueba válida', async () => {
            const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 días restantes
            db.query.mockResolvedValueOnce({
                rows: [{
                    id: '1',
                    email: 'test@test.com',
                    trial_end_date: futureDate
                }]
            });

            const resp = await request(app).get('/api/trial-status/test@test.com');
            expect(resp.status).toBe(200);
            expect(resp.body.data.isExpired).toBe(false);
            expect(resp.body.data.daysRemaining).toBeGreaterThanOrEqual(5); // redondeado
        });

        it('Debe retornar estado expirado si la fecha ya pasó', async () => {
            const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 días atrás
            db.query.mockResolvedValueOnce({
                rows: [{
                    id: '1',
                    email: 'test@test.com',
                    trial_end_date: pastDate
                }]
            });

            const resp = await request(app).get('/api/trial-status/test@test.com');
            expect(resp.status).toBe(200);
            expect(resp.body.data.isExpired).toBe(true);
            expect(resp.body.data.daysRemaining).toBe(0);
        });
    });
});
