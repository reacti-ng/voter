# must be run as the postgres user

DROP DATABASE voter;
DROP USER voter;

CREATE DATABASE voter;
CREATE USER voter WITH PASSWORD 'voterdev';
ALTER USER voter SET client_encoding TO 'utf8';
ALTER ROLE voter SET timezone TO 'utc';

GRANT ALL PRIVILEGES ON DATABASE voter to voter;
