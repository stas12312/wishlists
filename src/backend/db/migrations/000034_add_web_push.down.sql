DELETE FROM notification_deliveries WHERE channel = 'web_push';
DELETE FROM notification_preferences WHERE channel = 'web_push';
ALTER TABLE notification_deliveries DROP CONSTRAINT notification_deliveries_channel_check;
ALTER TABLE notification_deliveries ADD CHECK (channel IN ('email', 'telegram'));
ALTER TABLE notification_preferences DROP CONSTRAINT notification_preferences_channel_check;
ALTER TABLE notification_preferences ADD CHECK (channel IN ('email', 'telegram'));
DROP TABLE notification_push_subscriptions;
