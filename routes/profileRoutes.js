import express from 'express';
import { userPersonalDetails } from '../controllers/profileController.js';

const router = express.Router();

router.post('/personal_details/:id', userPersonalDetails)

export default router