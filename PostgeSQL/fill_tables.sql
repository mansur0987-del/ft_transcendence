INSERT INTO type_chat (id, name)
VALUES (0, 'direct_chat');
INSERT INTO type_chat (id, name)
VALUES (1, 'public');
INSERT INTO type_chat (id, name)
VALUES (2, 'private');

INSERT INTO achievement (id, name)
VALUES (0, 'First game');

INSERT INTO achievement (name)
VALUES ('First win');

-- test values

INSERT INTO player (id, name, online, admin)
VALUES (0 ,'test_user_0', FALSE, TRUE);

INSERT INTO player (name, online, admin)
VALUES ('test_user_1', TRUE, TRUE);

INSERT INTO player (name, online, admin)
VALUES ('test_user_2', FALSE, FALSE);

INSERT INTO players_achiev (player_id, achievement_id)
VALUES (0, 0);

INSERT INTO players_achiev (player_id, achievement_id)
VALUES (0, 1);

INSERT INTO game (id, win_player_id, date)
VALUES (0, 0, CURRENT_TIMESTAMP);

INSERT INTO players_game (player_id, game_id)
VALUES (0, 0);

INSERT INTO chat (id, type_id)
VALUES (0, 0);

INSERT INTO players_chat (player_id, chat_id)
VALUES (0, 0);









