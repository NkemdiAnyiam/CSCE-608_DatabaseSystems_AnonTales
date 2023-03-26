DROP DATABASE IF EXISTS anon_tales_db;
CREATE DATABASE anon_tales_db;
USE anon_tales_db;

-- Relations
CREATE TABLE Users (
  serial_no VARCHAR(60) PRIMARY KEY
);

CREATE TABLE Stories(
	story_id CHAR(36) PRIMARY KEY,
  user_serial_no VARCHAR(60),
	title VARCHAR(100),
	text_content VARCHAR(5000),
	publish_date DATE,
	FOREIGN KEY (user_serial_no) REFERENCES Users(serial_no)
		ON DELETE CASCADE
);

CREATE TABLE Reviews(
	PRIMARY KEY (story_id, user_serial_no),
	story_id CHAR(36),
	user_serial_no VARCHAR(60),
	text_content VARCHAR(500),
	publish_date DATE,
	FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE,
	FOREIGN KEY (user_serial_no) REFERENCES Users(serial_no)
		ON DELETE CASCADE
);


CREATE TABLE Genres(
	genre_name VARCHAR(40) PRIMARY KEY
);

CREATE TABLE Prompts(
	prompt_id CHAR(36) PRIMARY KEY,
	user_serial_no VARCHAR(60),
	text_content VARCHAR(300),
  publish_date DATE,
	FOREIGN KEY (user_serial_no) REFERENCES Users(serial_no)
		ON DELETE CASCADE
);


-- Relationships
CREATE TABLE Rated(
	PRIMARY KEY (story_id, user_serial_no),
	story_id CHAR(36),
	user_serial_no VARCHAR(60),
	rating INT
		CHECK (rating >= 1 AND rating <= 5),
	FOREIGN KEY (user_serial_no) REFERENCES Users(serial_no)
		ON DELETE CASCADE,
  FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE
);

CREATE TABLE FallsUnder(
	PRIMARY KEY (story_id, genre_name),
	story_id CHAR(36),
	genre_name VARCHAR(40),
	FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE,
	FOREIGN KEY (genre_name) REFERENCES Genres(genre_name)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);

CREATE TABLE PromptsGenre(
	PRIMARY KEY (prompt_id, genre_name),
	prompt_id CHAR(36),
	genre_name VARCHAR(40),
	FOREIGN KEY (prompt_id) REFERENCES Prompts(prompt_id)
		ON DELETE CASCADE,
	FOREIGN KEY (genre_name) REFERENCES Genres(genre_name)
		ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Thumbed(
	PRIMARY KEY (story_id, reviewer_serial_no, user_serial_no),
	story_id CHAR(36),
	reviewer_serial_no VARCHAR(60),
	user_serial_no VARCHAR(60),
	bin_value INT
		CHECK (bin_value = 0 OR bin_value = 1),
	FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE,
  FOREIGN KEY (reviewer_serial_no) REFERENCES Users(serial_no)
		ON DELETE CASCADE,
  FOREIGN KEY (user_serial_no) REFERENCES Users(serial_no)
		ON DELETE CASCADE,
	CHECK (reviewer_serial_no <> user_serial_no)
);


-- Triggers
DELIMITER $$
CREATE TRIGGER NoSelfReview
BEFORE INSERT ON Reviews
FOR EACH ROW
BEGIN
  DECLARE msg VARCHAR(128);
	IF
		new.user_serial_no = (SELECT Stories.user_serial_no FROM Stories WHERE Stories.story_id = new.story_id)
	THEN
      SET msg = 'MyTriggerError: Trying to insert a review for the reviewer''s own story';
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END$$
DELIMITER ;
