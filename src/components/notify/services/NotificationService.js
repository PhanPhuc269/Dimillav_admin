const webPush = require('@config/webPushConfig');
const redisClient = require('@config/db/redisClient');
const UserService = require('@components/auth/services/UserService');
const AccountService = require('@components/account/services/AccountService');
const Notification = require('../models/Notification');
const Messnotification = require('../models/Messnotification');

class NotificationService {
    
    async sendNotificationByUsername(username, notification) {
        const user = await AccountService.getAccountByUsername(username);
        if (!user) {
            throw new Error('User not found');
        }
        const subscriptions = await redisClient.get(`subscriptions:${user._id}`);
        if (!subscriptions) {
           console.error(`Subscriptions not found for user ${user.username}`);
            return;
        }

        const subscriptionArray = JSON.parse(subscriptions);


        const notificationPayload = {
            title: notification.title || 'New Notification',
            body: notification.body || 'This is a test notification',
            icon: notification.icon || '/js/logo.png',
            url: notification.url || '/',
        };
    
        const sendPromises = subscriptionArray.map(subscription => {
            return webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
                .catch(error => {
                    console.error(`Failed to send notification to subscription ${subscription.endpoint}:`, error);
                    // Xóa ra khỏi database nếu gặp lỗi
                    subscriptionArray.splice(subscriptionArray.indexOf(subscription), 1);
                    redisClient.set(`subscriptions:${user._id}`, JSON.stringify(subscriptionArray));
                    
                    return Promise.resolve(); // Return a resolved promise to avoid interruption
                });
        });
        
        await Promise.all(sendPromises); // Wait for all notifications to be sent
  
    }
    async sendNotificationToAdmin(notification) {
        try {
            // Gửi thông báo đến tất cả admin
            const admins = await UserService.getAllAdmins();
            const adminIds = admins.map(admin => admin._id);
            
            const results = await Promise.all(adminIds.map(async adminId => {
                try {
                    const result = await this.sendNotification(adminId, notification);
                    return { status: 'fulfilled', value: result };
                } catch (error) {
                    return { status: 'rejected', reason: error };
                }
            }));
    
            results.forEach(result => {
                if (result.value.status === 'rejected') {
                    console.error(`Failed to send notification to admin: ${result.value.reason}`);
                } else {
                    console.log(`Notification sent to admin: ${result.value.value}`);
                }
            });
        } catch (error) {
            console.error('Error in sendNotificationToAdmins:', error);
        }
    }
    async sendNotification(userId, notification) {
        const subscriptions = await redisClient.get(`subscriptions:${userId}`);
        if (!subscriptions) {
            throw new Error('Subscriptions not found');
        }

        const subscriptionArray = JSON.parse(subscriptions);


        const notificationPayload = {
            title: notification.title || 'New Notification',
            body: notification.body || 'This is a test notification',
            icon: notification.icon || '/js/logo.png',
            url: notification.url || '/',
        };
    
        const sendPromises = subscriptionArray.map(subscription => {
            return webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
                .catch(error => {
                    console.error(`Failed to send notification to subscription ${userId}:`, error);
                    // Xóa ra khỏi database nếu gặp lỗi
                    subscriptionArray.splice(subscriptionArray.indexOf(subscription), 1);
                    redisClient.set(`subscriptions:${userId}`, JSON.stringify(subscriptionArray));
                    
                    return Promise.resolve(); // Return a resolved promise to avoid interruption
                });
        });
        
        return await Promise.all(sendPromises); // Wait for all notifications to be sent

    }
    async getAllNotifications() {
        // Lấy tất cả thông báo của user
        const notifications = await Notification.find({user: undefined}).sort({ createdAt: -1 });
        return notifications;
    }
    async getAllMessnotifications() {
        // Lấy tất cả thông báo của user
        const messnotifications = await Messnotification.find({receiver: 'admin'}).sort({ createdAt: -1 });
        return messnotifications;
    }
}

module.exports = new NotificationService();




