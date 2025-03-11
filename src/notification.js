const {redisPubClient, redisSubClient} = require('@config/db/redisPubSubClient');
const notifyService = require('@components/notify/services/NotificationService');
// Lắng nghe thông báo từ Redis
function listenForNotifications(channel, onMessage) {
    redisSubClient.subscribe(channel, (data) => {
        const notification = JSON.parse(data);
        const message = {
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            url: notification.url,
        };
        
        notifyService.sendNotificationByUsername( notification.receiver, message);
    });


    redisSubClient.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
            console.log(`Received message from channel "${channel}":`, message);

            // Gọi callback xử lý tin nhắn
            const notification = JSON.parse(message);
            onMessage(notification);
        }
    });
}

// Gửi thông báo đến Redis
async function sendNotification(channel, notification) {
    try{

        const message = JSON.stringify(notification); // Convert notification to JSON string
        await redisPubClient.publish(channel, message, (err, reply) => {
            if (err) {
                console.error('Error publishing message to Redis:', err);
            } else {
                console.log(`Message published to channel "${channel}":`, message);
            }
        });
    }
    catch(err){
        console.error('Error in sendNotification:', err);
    }
}

module.exports = {
    listenForNotifications,
    sendNotification,
};
