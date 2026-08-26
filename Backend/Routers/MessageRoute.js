const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/MessageController');
const authMiddleware = require('../Middleware/authMiddleware'); // ensures user is logged in

// User sends a message
router.post('/messages', authMiddleware, messageController.sendMessage);

// Admin views messages they received
router.get('/messages/admin', authMiddleware, messageController.getMessagesForAdmin);

// User views their own sent messages
router.get('/messages/user', authMiddleware, messageController.getMessagesForUser);

// Delete a message (sender or receiver only)
router.delete('/messages/:id', authMiddleware, messageController.deleteMessage);

module.exports = router;