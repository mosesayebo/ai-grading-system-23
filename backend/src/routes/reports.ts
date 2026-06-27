import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { name, payload } = req.body;
  const report = await prisma.report.create({ data: { name, payload } });
  res.json(report);
});

router.get('/', async (req, res) => {
  const reports = await prisma.report.findMany();
  res.json(reports);
});

export default router;
