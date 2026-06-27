import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// List students
router.get('/', async (req, res) => {
  const students = await prisma.student.findMany();
  res.json(students);
});

// Get a student by id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const student = await prisma.student.findUnique({ where: { id }});
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

// Create student
router.post('/', async (req, res) => {
  const { matric, name, department, email, level } = req.body;
  const student = await prisma.student.create({ data: { matric, name, department, email, level }});
  res.json(student);
});

// Update student
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const student = await prisma.student.update({ where: { id }, data });
  res.json(student);
});

// Delete
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.student.delete({ where: { id }});
  res.json({ ok: true });
});

export default router;
