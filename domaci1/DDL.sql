drop schema test cascade;
create schema test;

set search_path to test; 

CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    usertype VARCHAR(50) NOT NULL
);

INSERT INTO players (id, username, password, usertype) 
VALUES 
(1, 'test', 'test', 'user'),
(2, 'eldaradmin', 'eldaradmin1234', 'admin'),
(3, 'guest', 'guest', 'guest');


CREATE TABLE IF NOT EXISTS records (
    id serial4 NOT NULL,
    document_name varchar(255) NOT NULL,
    document_type varchar(50) NOT NULL,
    player_id int4 NOT NULL,
    mark int4 NULL,
    documentpath varchar(255) NULL,
    CONSTRAINT records_pkey PRIMARY KEY (id),
    CONSTRAINT fk_player_id FOREIGN KEY (player_id) REFERENCES players(id)
);
