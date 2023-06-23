CREATE TABLE IF NOT EXISTS user (
	id SERIAL NOT NULL PRIMARY KEY,
	username VARCHAR ( 100 ) UNIQUE NOT NULL,
	intraId VARCHAR ( 100 ) UNIQUE NOT NULL,
	password VARCHAR ( 100 ) NOT NULL,
	avatar BYTEA, -- image
	isTwoFactorEnabled BOOLEAN DEFAULT FALSE,
	twoFactorSecret VARCHAR ( 100 ),
	createdAt TIMESTAMP,
	updatedAt TIMESTAMP,
	win INTEGER DEFAULT 0,
	loses INTEGER DEFAULT 0,
	status VARCHAR ( 100 ) DEFAULT 'offline'
);

CREATE TABLE IF NOT EXISTS achievement (
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR ( 100 ) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS players_achiev (
	player_id SERIAL NOT NULL,
	achievement_id SERIAL NOT NULL,
	PRIMARY KEY (player_id, achievement_id),
	FOREIGN KEY (player_id)
		REFERENCES player (id),
	FOREIGN KEY (achievement_id)
		REFERENCES achievement (id)
);

CREATE TABLE IF NOT EXISTS game (
	id SERIAL NOT NULL PRIMARY KEY,
	win_player_id SERIAL,
	date TIMESTAMP,
	FOREIGN KEY (win_player_id)
		REFERENCES player (id)
);

CREATE TABLE IF NOT EXISTS players_game (
	player_id SERIAL NOT NULL,
	game_id SERIAL NOT NULL,
	PRIMARY KEY (player_id, game_id),
	FOREIGN KEY (player_id)
		REFERENCES player (id),
	FOREIGN KEY (game_id)
		REFERENCES game (id)
);

CREATE TABLE IF NOT EXISTS type_chat (
	id SERIAL NOT NULL PRIMARY KEY,
	name CHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS chat (
	id SERIAL NOT NULL PRIMARY KEY,
	type_id SERIAL NOT NULL,
	have_password BOOLEAN DEFAULT FALSE,
	password VARCHAR(100),
	FOREIGN KEY (type_id)
		REFERENCES type_chat (id)
);

CREATE TABLE IF NOT EXISTS message (
	id SERIAL NOT NULL PRIMARY KEY,
	chat_id SERIAL NOT NULL,
	message VARCHAR(1000) NOT NULL,
	player_id SERIAL NOT NULL,
	date TIMESTAMP NOT NULL,
	FOREIGN KEY (chat_id)
		REFERENCES chat (id),
	FOREIGN KEY (player_id)
		REFERENCES player (id)
);

CREATE TABLE IF NOT EXISTS players_chat (
	player_id SERIAL NOT NULL,
	chat_id SERIAL NOT NULL,
	owner BOOLEAN DEFAULT FALSE,
	blocked BOOLEAN DEFAULT FALSE,
	blocked_time TIMESTAMP,
	PRIMARY KEY (player_id, chat_id),
	FOREIGN KEY (player_id)
		REFERENCES player (id),
	FOREIGN KEY (chat_id)
		REFERENCES chat (id)
);


