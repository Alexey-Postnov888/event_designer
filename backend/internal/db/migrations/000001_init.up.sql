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
    name TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ
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

-- Тестовые данные для таблицы users
INSERT INTO users (email, name, password, type_of_activity, role) VALUES
    ('admin@example.com', 'Главный Администратор', 'admin_hash_secure', 'IT', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, name, password, type_of_activity, role) VALUES
    ('observer1@example.com', 'Наблюдатель 1', 'observer_hash_1', 'Finance', 'observer'),
    ('observer2@example.com', 'Наблюдатель 2', 'observer_hash_2', 'Marketing', 'observer')
ON CONFLICT (email) DO NOTHING;


-- Тестовые данные для таблицы events
INSERT INTO events (id, name, description, starts_at, ends_at) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Конференция по AI', 'Ежегодная конференция о последних трендах в AI.', '2025-12-01 10:00:00+03', '2025-12-01 18:00:00+03'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Воркшоп по PostgreSQL', 'Глубокое погружение в оптимизацию PostgreSQL.', '2025-12-05 09:30:00+03', '2025-12-05 13:00:00+03');

-- Тестовые данные для таблицы event_allowed_emails
INSERT INTO event_allowed_emails (event_id, email) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'observer1@example.com'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'observer2@example.com');