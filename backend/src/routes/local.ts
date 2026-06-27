import express from 'express';
import { gradeWithNLP } from '../services/aiService';
const router = express.Router();

router.post('/grade', async (req, res) => {
  const { modelAnswer, studentAnswer } = req.body;
  if (!modelAnswer || !studentAnswer) return res.status(400).json({ error: 'modelAnswer and studentAnswer required' });
  const grading = await gradeWithNLP({ modelAnswer, studentAnswer });
  res.json(grading);
});

export default router;
