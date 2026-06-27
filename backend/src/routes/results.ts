import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const results = await prisma.result.findMany({ include: { student: true, exam: { include: { course: true }}}});
  res.json(results);
});

export default router;
