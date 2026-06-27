import express from 'express';
import { PrismaClient } from '@prisma/client';
import { gradeAnswer } from '../services/aiService';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const exams = await prisma.exam.findMany({ include: { course: true }});
  res.json(exams);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const exam = await prisma.exam.findUnique({ where: { id }, include: { course: true }});
  if (!exam) return res.status(404).json({ error: 'not found' });
  res.json(exam);
});

// create exam
router.post('/', async (req, res) => {
  const { courseId, title, prompt, modelAnswer, semester } = req.body;
  if (!courseId || !title) return res.status(400).json({ error: 'courseId and title required' });
  const exam = await prisma.exam.create({ data: { courseId, title, prompt: prompt || '', modelAnswer: modelAnswer || '', semester } });
  res.json(exam);
});

// Upload and grade (file or text)
router.post('/:id/upload-and-grade', upload.single('script'), async (req, res) => {
  const examId = Number(req.params.id);
  const { studentId, studentText } = req.body;
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { course: true }});
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  let answerText = studentText || '';
  if (req.file && req.file.buffer) answerText = req.file.buffer.toString('utf8');

  if (!studentId || !answerText) return res.status(400).json({ error: 'studentId and answer required' });

  const grading = await gradeAnswer({ prompt: exam.prompt, modelAnswer: exam.modelAnswer || '', studentAnswer: answerText, courseTitle: exam.course.title });
  const score = grading.score;
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  const result = await prisma.result.create({ data: { studentId: Number(studentId), examId: exam.id, score, grade, feedback: grading.feedback } });

  res.json({ result, grading });
});

export default router;
