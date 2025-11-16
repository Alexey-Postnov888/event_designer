-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    type_of_activity TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'observer'))
);

-- Таблица мероприятий
CREATE TABLE events (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

-- учасьники мероприятия, которые имеют доступ к событию
CREATE TABLE event_allowed_emails (
    event_id UUID REFERENCES events(id),
    email TEXT NOT NULL,
    PRIMARY KEY (event_id, email)
);

-- Временные коды потверждения
CREATE TABLE verification_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);


-- Добавляем тестовые данные
INSERT INTO users (email, password, role) VALUES
('admin@example.com', 'admin123', 'admin');

INSERT INTO events (id, name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test Event');

INSERT INTO event_allowed_emails (event_id, email) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com');