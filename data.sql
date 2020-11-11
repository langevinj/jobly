CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees int,
    description text,
    logo_url text
);

CREATE TABLE technologies (
    tech_id SERIAL PRIMARY KEY,
    tech_name text NOT NULL UNIQUE
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK (equity <= 1.0),
    company_handle text REFERENCES companies ON DELETE CASCADE,
    requirements text,
    date_posted timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    username text PRIMARY KEY,
    pwd text NOT NUll,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE applications (
    username text NOT NULL REFERENCES users ON DELETE CASCADE,
    job_id int NOT NULL REFERENCES jobs ON DELETE CASCADE,
    state text NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

