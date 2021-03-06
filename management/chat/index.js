'use strict';
const redis = require('redis');

module.exports = function (hook) {
    hook.method('permission', 'deleteMessage', ['remove_message', require('./delete')]);
    hook.on('booted', () => {
        const clip = require('../../clip');
        const client = redis.createClient(clip.config.get('redis'));
        client.on('pmessage', (pattern, event, data) => {
            if (!event.match(/chatcompat\:[0-9]+\:deleteMessage/)) {
                return;
            }
            try {
                data = JSON.parse(data);
            } catch (e) {
                return;
            }

            try {
                require('./delete').remove(event.split(':')[1], data.id, data.user_id, data.user_roles);
            } catch (e) {} // Ignore catch
        });

        client.psubscribe('chatcompat:*:deleteMessage');
    })
};
