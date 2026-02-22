CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS gyms CASCADE;
DROP TABLE IF EXISTS trial_registrations CASCADE;

CREATE TABLE IF NOT EXISTS trial_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    gym_name VARCHAR(255) NOT NULL,
    trial_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trial_end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES trial_registrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    nit_ruc VARCHAR(100),
    legal_representative VARCHAR(255),
    corporate_phone VARCHAR(50),
    currency VARCHAR(50),
    tax_name VARCHAR(50),
    tax_percentage DECIMAL(5,2),
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
