CREATE TABLE IF NOT EXISTS avatar (
	id SERIAL NOT NULL PRIMARY KEY,
	filename VARCHAR ( 100 ) NOT NULL,
	data BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS player (
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR ( 100 ) UNIQUE NOT NULL,
	name42 VARCHAR ( 100 ) UNIQUE NOT NULL,
	avatarId SERIAL UNIQUE,
	isLogin BOOLEAN DEFAULT FALSE,
	twoFactorAuthenticationSecret VARCHAR ( 100 ),
	isTwoFactorAuthenticationEnabled BOOLEAN DEFAULT FALSE,
	isLoginFactorAuthentication BOOLEAN DEFAULT FALSE,
	isFirstGame BOOLEAN DEFAULT FALSE,
	isFirstWin BOOLEAN DEFAULT FALSE,
	create_at TIMESTAMP,
	update_at TIMESTAMP,
	delete_at TIMESTAMP,
	FOREIGN KEY (avatarId)
		REFERENCES avatar (id)
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


