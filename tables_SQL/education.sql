create table education
(
  IDP                       INTEGER PRIMARY KEY AUTOINCREMENT,
  id_user                   INTEGER not null,
  name                      VARCHAR(50),
  surname                   VARCHAR(80),
  education_place           VARCHAR(20) default "school",
    study_level             INTEGER(5)     default 0,
  budget                    BOOLEAN    default 0,
  school_course             INTEGER(2) default 1,
  college_course            INTEGER(2),
  university_course         INTEGER(2),
  count_of_lessons_now      INTEGER(8),
  count_of_classes_attended INTEGER(8),
  begin_course              INTEGER

);

create unique index education_id_user_uindex
  on education (id_user);

