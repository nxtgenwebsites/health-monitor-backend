import express from 'express';
import authenticateToken from '../utils/jwt.js';
import { blockUser, deleteUser, editUser, getAllUser, getOneUser, unblockUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/get-all-users', authenticateToken , getAllUser);
router.delete('/delete-user/:userId', authenticateToken, deleteUser);
router.put('/block-user/:userId', authenticateToken, blockUser);
router.put('/unblock-user/:userId', authenticateToken, unblockUser);
router.put('/edit/:userId', authenticateToken, editUser);
router.get('/get-user/:userId' , getOneUser);


export default router