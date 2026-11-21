BEGIN;

DELETE FROM notification_preferences WHERE NOT enabled;
ALTER TABLE notification_preferences DROP COLUMN enabled;

COMMIT;
