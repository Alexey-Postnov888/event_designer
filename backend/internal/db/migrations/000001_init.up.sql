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
    address TEXT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    creator_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE
);

-- учасьники мероприятия, которые имеют доступ к событию
CREATE TABLE event_allowed_emails (
    event_id UUID REFERENCES events(id),
    email TEXT NOT NULL,
    PRIMARY KEY (event_id, email)
);

-- карты меро
CREATE TABLE event_maps (
    event_id UUID PRIMARY KEY REFERENCES events (id) ON DELETE CASCADE,
    
    map_url TEXT NOT NULL,                
    map_storage_path TEXT NOT NULL,       
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица точек
CREATE TABLE points (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    x INT NOT NULL,
    y INT NOT NULL,
    title TEXT NOT NULL, 
    
    -- Поля Таймлайна
    timeline_description TEXT, 
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ
);

CREATE INDEX idx_points_event_id ON points (event_id);

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
INSERT INTO events (id, name, description, address, starts_at, ends_at, creator_email) VALUES
	    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Конференция по AI', 'Ежегодная конференция о последних трендах в AI.', 'Ул. Программистов, 15', '2025-12-01 10:00:00+03', '2025-12-01 18:00:00+03', 'admin@example.com'),
	    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Воркшоп по PostgreSQL', 'Глубокое погружение в оптимизацию PostgreSQL.', 'Пр-т Баз данных, 101', '2025-12-05 09:30:00+03', '2025-12-05 13:00:00+03', 'admin@example.com');

-- Тестовые данные для таблицы event_allowed_emails
INSERT INTO event_allowed_emails (event_id, email) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'observer1@example.com'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'observer2@example.com');


-- Тестовые данные для точек и таймлайнов
INSERT INTO points (id, event_id, x, y, title, timeline_description, start_at, end_at) VALUES
    ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    100, 400, 'Техническая поддержка', NULL, NULL, NULL);
INSERT INTO points (id, event_id, x, y, title, timeline_description, start_at, end_at) VALUES
    ('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    50, 100, 'Стойка регистрации', 'Регистрация участников и утренний кофе.', '2025-12-01 09:00:00+03', '2025-12-01 10:00:00+03');
INSERT INTO points (id, event_id, x, y, title, timeline_description, start_at, end_at) VALUES
    ('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    400, 250, 'Зал "Платина"', 'Доклад "Будущее генеративного AI" от д-ра Смита.', '2025-12-01 10:30:00+03', '2025-12-01 12:00:00+03');