import { Router } from 'express';
import { getStartupById, getStartups } from '../controllers/startupController.js';

const router = Router();

router.get('/', getStartups);
router.get('/:startupId', getStartupById);

export default router;

