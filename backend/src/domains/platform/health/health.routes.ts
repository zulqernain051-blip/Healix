import { Router } from 'express';
import { getHealth } from './health.controller';

const router = Router();

// GET / health endpoint
router.get('/', getHealth);

export default router;
