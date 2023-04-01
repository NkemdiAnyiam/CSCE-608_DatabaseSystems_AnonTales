DROP DATABASE anon_tales_db;
CREATE DATABASE anon_tales_db;
USE anon_tales_db;

-- Relations
CREATE TABLE Users (
  serial_number VARCHAR(60) PRIMARY KEY
);

CREATE TABLE Stories(
	PRIMARY KEY(serial_number, story_id),
  serial_number VARCHAR(60),
	story_id INT,
	title VARCHAR(100),
	text_content VARCHAR(5000),
	publish_date DATE,
	FOREIGN KEY (serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE
);

CREATE TABLE Reviews(
	PRIMARY KEY (author_serial_number, story_id, reviewer_serial_number),
	author_serial_number VARCHAR(60),
	reviewer_serial_number VARCHAR(60),
	story_id INT,
	text_content VARCHAR(500),
	publish_date DATE,
	FOREIGN KEY (author_serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE,
	FOREIGN KEY (reviewer_serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE,
	FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE
);

CREATE TABLE Genres(
	genre_name VARCHAR(40) PRIMARY KEY
);

CREATE TABLE Prompts(
	PRIMARY KEY (serial_number, prompt_id),
	serial_number VARCHAR(60),
	prompt_id INT,
	text_content VARCHAR(300),
  publish_date DATE,
	FOREIGN KEY (serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE
);


-- Relationships
CREATE TABLE Rated(
	PRIMARY KEY (serial_number, story_id),
	serial_number VARCHAR(60),
	story_id INT,
	rating INT
		CHECK (rating >= 1 AND rating <= 5),
	FOREIGN KEY (serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE,
  FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE
);

CREATE TABLE FallsUnder(
	PRIMARY KEY (serial_number, story_id, genre_name),
	serial_number VARCHAR(60),
	story_id INT,
	genre_name VARCHAR(40),
	FOREIGN KEY (serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE,
	FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE,
	FOREIGN KEY (genre_name) REFERENCES Genres(genre_name)
);

CREATE TABLE PromptsGenre(
	PRIMARY KEY (serial_number, prompt_id, genre_name),
	serial_number VARCHAR(60),
	prompt_id INT,
	genre_name VARCHAR(40),
	FOREIGN KEY (serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE,
	FOREIGN KEY (serial_number, prompt_id) REFERENCES Prompts(serial_number, prompt_id)
		ON DELETE CASCADE,
	FOREIGN KEY (genre_name) REFERENCES Genres(genre_name)
		ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Thumbed(
	PRIMARY KEY (serial_number, story_id),
	serial_number VARCHAR(60),
	story_id INT,
	bin_value INT
		CHECK (bin_value = 0 OR bin_value = 1),
  FOREIGN KEY (serial_number) REFERENCES Users(serial_number)
		ON DELETE CASCADE,
	FOREIGN KEY (story_id) REFERENCES Stories(story_id)
		ON DELETE CASCADE
);
