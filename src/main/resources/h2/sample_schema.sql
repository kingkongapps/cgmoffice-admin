DROP TABLE IF EXISTS authority;

CREATE TABLE authority (
  authority_name varchar(100),
  username varchar(100)
);

DROP TABLE IF EXISTS file_info;

CREATE TABLE file_info (
  stor_file_nm varchar(100),
  org_file_nm varchar(500),
  file_ext varchar(10),
  path varchar(100),
  file_size varchar(100),
  content_type varchar(100),
  del_yn varchar(1),
  thumbnail_base64 longtext,
  reg_username varchar(100),
  reg_dt timestamp,
  mod_username varchar(100),
  mod_dt timestamp
);


DROP TABLE IF EXISTS user_info;

CREATE TABLE user_info (
  username varchar(100),
  password varchar(100),
  activate_yn varchar(1)
);

DROP TABLE IF EXISTS test_01;

CREATE TABLE test_01 (
  idx int NOT NULL AUTO_INCREMENT,
  user_name varchar(100),
  user_age int,
  create_dt datetime
);

DROP TABLE IF EXISTS test_file_mng;

CREATE TABLE test_file_mng (
  idx int NOT NULL AUTO_INCREMENT,
  memo varchar(100),
  file_info varchar(100),
  reg_dt timestamp NULL DEFAULT CURRENT_TIMESTAMP
);