const ChatService = require('./service/ChatService');

module.exports = (io, socket) => {
    const userId = socket.request.user._id; // Lấy userId từ session
    const username = socket.request.user.username; // Lấy username từ
    // Đăng ký userId
    ChatService.registerUser(socket, userId,username);

    // Tải tin nhắn cũ từ MongoDB
    socket.on('load-messages', (receiverID) => {
        ChatService.loadMessages(socket, userId, receiverID);
    });

    // Tải tin nhắn gần đây từ MongoDB
    socket.on('recent-messages', () => {
        ChatService.loadRecentMessages(socket, userId);
    });

    // Xử lý sự kiện gửi tin nhắn
    socket.on('chat message', (data) => {
        ChatService.handleMessage(io, socket, data);
    });

    // Xử lý sự kiện ngắt kết nối
    socket.on('disconnect', () => {
        ChatService.handleDisconnect(socket);
    });
};