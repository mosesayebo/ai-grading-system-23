import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const courses = await prisma.course.findMany({ include: { lecturer: true }});
  res.json(courses);
});

router.post('/', async (req, res) => {
  const { code, title, credits, lecturerId, semester } = req.body;
  const course = await prisma.course.create({ data: { code, title, credits, lecturerId, semester } });
  res.json(course);
});

export default router;
