CREATE TABLE ignorelist
(
    IDP INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    name VARCHAR(50),
    surname VARCHAR(80),
    ignoring BOOLEAN DEFAULT 0
);
CREATE UNIQUE INDEX ignorelist_id_user_uindex ON ignorelist (id_user);