const { mutipleMongooseToObject } = require('@utils/mongoose');
const { mongooseToObject } = require('@utils/mongoose');
const ChatService = require('../service/ChatService');
const AccountService = require('../../account/services/AccountService');

class ChatController{
    async viewChatRoom(req, res, next) {
        try {
            const recentMessages = await ChatService.loadRecentMessages(null, req.user._id);
            res.render('chat-room', { layout: 'no-footer', recentMessages: (recentMessages) });
        } catch (error) {
            // Xử lý lỗi
            next(error);
        }
    }
    async getChatRoom(req, res, next) {
        try {
            const username = req.params.username;
            const messages = await ChatService.getOldMessages(req.user._id, username);
            res.status(200).json({ messages: messages });
        }
        catch (error) {
            // Xử lý lỗi
            next(error);
        }
    }
    async viewChat(req, res, next) {
        try {
            const username = req.params.username;
            const receiver = await AccountService.getAccountByUsername(username);
            if (!receiver.name)
            {
                receiver.name = receiver.username;
            }
            const recentMessages = await ChatService.loadRecentMessages(null, req.user._id);
            const messages = await ChatService.getOldMessages(req.user._id, username);
            res.render('chat-room', { layout: 'no-footer', receiver, messages: (messages), recentMessages: (recentMessages) });
        }
        catch (error) {
            // Xử lý lỗi
            next(error);
        }
    }


}

module.exports = new ChatController();
