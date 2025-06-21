import express from 'express';
import { handleTriage } from '../controllers/triageController.js';

const router = express.Router();

router.post('/', handleTriage);

export default router; 