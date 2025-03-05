import express from 'express';
import { loginUser, signupUser, userVerifyByEmail, verifyUser } from '../controllers/authController.js'

const router = express.Router();

router.post('/sign_up', signupUser);
router.post('/login', loginUser);
router.post('/email_verification', userVerifyByEmail);
router.get("/verify", verifyUser);

export default router