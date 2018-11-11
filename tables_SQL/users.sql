create table users
(
  IDP                INTEGER     not null primary key autoincrement,
  id_user                 INTEGER(11) not null,
  name                    VARCHAR(50) not null,
  surname                 VARCHAR(80) not null,
  balanсe                 INTEGER(11) not null,
  rang                    VARCHAR(20) default 'User' not null
);
