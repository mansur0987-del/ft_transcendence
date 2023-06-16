INSERT INTO type_chat (name)
VALUES ('direct_chat');
INSERT INTO type_chat (name)
VALUES ('public');
INSERT INTO type_chat (name)
VALUES ('private');

-- test values

INSERT INTO player (name, name42, create_at, update_at)
VALUES ('test_user_0', 'test_user42_0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO player (name, name42, create_at, update_at)
VALUES ('test_user_1', 'test_user42_1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO player (name, name42, create_at, update_at)
VALUES ('test_user_2', 'test_user42_2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO game (id, win_player_id, date)
VALUES (0, 0, CURRENT_TIMESTAMP);

INSERT INTO players_game (player_id, game_id)
VALUES (0, 0);

INSERT INTO chat (id, type_id)
VALUES (0, 0);

INSERT INTO players_chat (player_id, chat_id)
VALUES (0, 0);









