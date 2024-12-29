CREATE TABLE IF NOT EXISTS friends
(
    f_user_id    bigint,
    s_user_id  bigint,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    FOREIGN KEY (f_user_id) REFERENCES users (user_id),
    FOREIGN KEY (s_user_id) REFERENCES users (user_id)
);

CREATE INDEX IF NOT EXISTS friends_f_user_id ON friends (f_user_id);
CREATE INDEX IF NOT EXISTS friends_s_user_id ON friends (s_user_id);

CREATE TABLE IF NOT EXISTS friend_requests
(
    from_user_id bigint,
    to_user_id   bigint,
    status       int8 DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at  TIMESTAMP WITH TIME ZONE,

    FOREIGN KEY (from_user_id) REFERENCES users (user_id),
    FOREIGN KEY (to_user_id) REFERENCES users (user_id)
);

CREATE INDEX IF NOT EXISTS friend_requests_from_user_id ON friend_requests (from_user_id);
CREATE INDEX IF NOT EXISTS friend_requests_to_user_id ON friend_requests (to_user_id);


