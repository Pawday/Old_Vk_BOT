create table users
(
  Id_prime                INTEGER     not null
    primary key
                                      autoincrement,
  id_user                 INTEGER(11) not null,
  Name                    VARCHAR(50) not null,
  Surname                 VARCHAR(50) not null,
  balanse                 INTEGER(11) default '2000',
  Rang                    VARCHAR(20) default 'User' not null
);
