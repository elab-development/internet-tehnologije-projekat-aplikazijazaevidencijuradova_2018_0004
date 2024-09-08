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


CREATE TABLE IF NOT EXISTS records (
	id serial4 NOT NULL,
	document_name varchar(255) NOT NULL,
	document_type varchar(50) NOT NULL,
	username varchar(255) NOT NULL,
	mark int4 NULL,
	documentpath varchar(255) NULL,
	CONSTRAINT records_pkey PRIMARY KEY (id)
);