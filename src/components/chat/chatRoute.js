const express = require ('express');
const router =express.Router();
const {ensureAuthenticated, ensureLogin } = require('@AuthMiddleware');

const chatController= require('./controllers/chatController');
 
router.get('/:username', ensureLogin, chatController.viewChat);
router.get('/messages/:username', ensureLogin, chatController.getChatRoom);
router.get('/', ensureLogin, chatController.viewChatRoom);


module.exports = router;