drop schema test cascade;
create schema test;

CREATE TABLE IF NOT EXISTS player (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    usertype VARCHAR(50) NOT NULL
);

INSERT INTO player (id, username, password, usertype) 
VALUES 
(1, 'test', 'test', 'user'),
(2, 'eldaradmin', 'eldaradmin1234', 'admin');