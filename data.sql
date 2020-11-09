CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees int,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id serial PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK (equity <= 1.0),
    company_handle text REFERENCES companies ON DELETE CASCADE,
    date_posted timestamp DEFAULT CURRENT_TIMESTAMP
)



