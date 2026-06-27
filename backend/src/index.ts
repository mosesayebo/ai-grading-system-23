import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import studentsRouter from './routes/students';
import coursesRouter from './routes/courses';
import examsRouter from './routes/exams';
import resultsRouter from './routes/results';
import reportsRouter from './routes/reports';
import localRouter from './routes/local';
import analyticsRouter from './routes/analytics';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/students', studentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/exams', examsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/local', localRouter);
app.use('/api/analytics', analyticsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
