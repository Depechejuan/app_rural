-- =========================================================
-- Script de inicialización para la aplicación "Rural Lease"
-- Crea las tablas principales y algunos datos de prueba
-- =========================================================

-- En caso de que se ejecute dentro de otra DB:
-- CREATE DATABASE ruraldb;

-- =====================
-- Limpieza previa
-- =====================
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================
-- Tabla de usuarios
-- =====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla de alojamientos
-- =====================
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    price_per_night NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- Tabla de reservas
-- =====================
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT booking_no_overlap CHECK (start_date <= end_date)
);

-- =====================
-- Índices útiles
-- =====================
CREATE INDEX idx_bookings_listing_dates ON bookings (listing_id, start_date, end_date);
CREATE INDEX idx_listings_owner ON listings (owner_id);

-- =====================
-- Usuarios de ejemplo
-- =====================
INSERT INTO users (name, email, password) VALUES
('Administrador Demo', 'admin@rurallease.com', '$2b$10$zRt1Fv8qQq/NZkCwWtbnuOqUlbT24RzI9WgE8wGZpIutNUzkDzqzG'), -- contraseña: admin123
('María López', 'maria@example.com', '$2b$10$zRt1Fv8qQq/NZkCwWtbnuOqUlbT24RzI9WgE8wGZpIutNUzkDzqzG');

-- =====================
-- Alojamientos de ejemplo
-- =====================
INSERT INTO listings (owner_id, title, description, location, price_per_night, image_url) VALUES
(1, 'Casa Rural Sierra Verde', 'Encantadora casa rural con chimenea y vistas al valle.', 'Granada, España', 95.00, 'https://picsum.photos/600/400?1'),
(1, 'Cabaña del Lago Azul', 'Ideal para desconectar y disfrutar de la naturaleza.', 'Asturias, España', 120.00, 'https://picsum.photos/600/400?2'),
(2, 'Finca Los Olivos', 'Perfecta para familias, rodeada de olivos centenarios.', 'Jaén, España', 80.00, 'https://picsum.photos/600/400?3');

-- =====================
-- Reservas de ejemplo
-- =====================
INSERT INTO bookings (user_id, listing_id, start_date, end_date, total_price)
VALUES
(2, 1, '2025-11-15', '2025-11-20', 475.00),
(1, 2, '2025-12-05', '2025-12-10', 600.00);

-- =====================
-- Vista rápida de datos
-- =====================
SELECT 'Usuarios creados:' AS info, COUNT(*) AS total FROM users;
SELECT 'Alojamientos creados:' AS info, COUNT(*) AS total FROM listings;
SELECT 'Reservas creadas:' AS info, COUNT(*) AS total FROM bookings;

