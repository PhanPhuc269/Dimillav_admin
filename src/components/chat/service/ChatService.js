const Message = require('../models/Message'); // Đảm bảo bạn đã định nghĩa model Message
const AccountService = require('@components/account/services/AccountService'); // Đảm bảo bạn đã định nghĩa service AccountService
const redisClient = require('@config/db/redisClient');
const Messnotification = require('@components/notify/models/Notification');
const {sendNotification} = require('@notification');

class ChatService {
    static async registerUser(socket, userId, username) {
        socket.emit('register', { username: username });
        await redisClient.set(`socket:${userId}`, socket.id); // Lưu socket.id vào Redis    
        console.log(`User ${userId} connected with socket ID ${socket.id}`);
    }

    static async loadMessages(socket, userId, receiverID) {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: receiverID },
                { receiver: userId, sender: receiverID }
            ]
        }).sort({ timestamp: 1 });

        // Gửi tin nhắn cũ đến người dùng
        socket.emit('load old messages', messages);
    }
    static async getOldMessages(userId, receiverName) {
        try{
            const receiver = await AccountService.getAccountByUsername(receiverName);
            let messages = [];
            if( receiver.role == 'admin'){
                messages = await Message.find({
                    $or: [
                        { sender: userId, receiver: receiver._id },
                        { receiver: userId, sender: receiver._id }
                    ]
                }).sort({ createdAt: 1 });
            }
            else{
                messages = await Message.find({
                    $or: [
                        { receiver: 'admin', sender: receiver._id },
                        { sender: userId, receiver: receiver._id },
                    ]
                }).sort({ createdAt: 1 });
            }
            const formattedMessages = messages.map(message => ({
                title: receiver.name || receiver.username,
                sender: message.sender == userId ? 'Bạn' : receiver.username,
                message: message.message,
                timestamp: message.createdAt,
                avatar: receiver.avatar,
            }));
    
            return formattedMessages;
        } catch (error) {
            console.error('Error fetching old messages:', error);
            throw error;
        }
    }

    static async loadRecentMessages(socket, userId) {
        try {
            let additionalNotices = [];
            const accounts = await AccountService.getAllAccounts();

            const recentMessages = await Promise.all(accounts.map(async account => {

                let messages = [];
                if( account.role == 'admin'){
                    messages = await Message.find({
                        $or: [
                            { sender: userId, receiver: account._id },
                            { receiver: userId, sender: account._id }
                        ]
                    }).sort({ createdAt: -1 }).limit(1);
                }
                else{
                    messages = await Message.find({
                        $or: [
                            { receiver: 'admin', sender: account._id },
                            { sender: userId, receiver: account._id },
                        ]
                    }).sort({ createdAt: -1 }).limit(1);
                }
                if (messages.length > 0) {
                    const message = messages[0];
                    if (message.sender == userId) {
                        const notice = {
                            title: account.name || account.username,
                            receiverName: account.username,
                            message: 'Bạn: ' + message.message,
                            timestamp: message.createdAt,
                            avatar: account.avatar,
                            
                        };
                        return notice;
                    } else {
                        // Lấy số lượng tin nhắn chưa đọc
                        const unreadMessages = await Messnotification.find({ sender: account.username, receiver: 'admin' });
                        
                        const notice = {
                            title: account.name || account.username,
                            receiverName: account.username,
                            message: (account.name || account.username )+ ': ' + message.message,
                            timestamp: message.createdAt,
                            avatar: account.avatar,
                            
                        };
                        if (unreadMessages.length > 0) {
                            notice.quantity = unreadMessages.length;
                        }
                        return notice;
                    }
                } else {
                    // const notice = {
                    //     title: account.name || account.username,
                    //     receiverID: account._id ,
                    //     message: 'No messages found',
                    //     timestamp: new Date(),
                    //     avatar: account.avatar,

                    // };
                    // additionalNotices.push(notice);
                    return null;
                }
            }));

            // Lọc bỏ các giá trị null từ recentMessages
            const filteredRecentMessages = recentMessages.filter(notice => notice !== null);
            filteredRecentMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            // Nối các notice từ additionalNotices vào recentMessages
            const combinedMessages = filteredRecentMessages.concat(additionalNotices);

            // Gửi tin nhắn cũ đến người dùng
            if (socket) socket.emit('recent-messages', combinedMessages);
            return combinedMessages;
        } catch (error) {
            console.error('Error loading recent messages:', error);
        }
    }

    static async handleMessage(io, socket, data) {
        const sender = await AccountService.getAccountByUsername(data.sender);
        const receiver = await AccountService.getAccountByUsername(data.receiver);

        const newMessage = new Message({
            sender: sender._id,
            receiver: receiver._id,
            message: data.message,
        });
        await newMessage.save();
        
        const receiverSocketId = await redisClient.get(`socket:${receiver._id}`);
        if (receiverSocketId) {
            // Gửi tin nhắn cho người nhận qua socket.id
            io.to(receiverSocketId).emit('chat message', data); // Gửi tin nhắn đến socket ID
        }else{
            const notificationPayload = {
                receiver: receiver.username,
                title: 'Bạn có tin nhắn mới',
                body: `${sender.name || sender.username}: ${data.message}`,
                icon: '/img/logo.png',
            };

            // Gửi thông báo cho người nhận
            await sendNotification('admin_notifications', notificationPayload);
        }
    }

    static async handleDisconnect(socket) {
        const userId = socket.request.user._id;
        //xóa socket.id khỏi Redis
        await redisClient.del(`socket:${userId}`);
        console.log('User disconnected');
    }
}

module.exports = ChatService;