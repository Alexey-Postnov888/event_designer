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