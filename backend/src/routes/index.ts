import { Router } from 'express';
import v1Router from './v1';

const router = Router();

// Route group mapping for API Version 1
router.use('/v1', v1Router);

export default router;
