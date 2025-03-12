import express from 'express';
import { addNextOfKin, childrenDetails, profileNotes, residentialDetails, userPersonalDetails } from '../controllers/profileController.js';

const router = express.Router();

router.post('/personal_details/:userId', userPersonalDetails);
router.post('/residential_details/:userId', residentialDetails);
router.post('/children_details/:userId', childrenDetails);
router.post('/add_kin/:userId', addNextOfKin);
router.post('/notes/:userId', profileNotes);

export default router