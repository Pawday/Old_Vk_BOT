CREATE TABLE alllist
(
    IDP INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER,
    name VARCHAR(50),
    surname VARCHAR(80)
);
CREATE UNIQUE INDEX alllist_id_user_uindex ON alllist (id_user);