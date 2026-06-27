# AI-Assisted Grading and Feedback System

Project: Lead City University - AI-Assisted Grading and Feedback System
Student: Adewale Gbolahan Okikiola
Matric Number: LCU/UG/22/23017
Department: Software Engineering
Institution: Lead City University, Ibadan, Nigeria

Overview
This full-stack app provides automatic grading and intelligent feedback for student answers using AI/NLP. It includes a Postgres database, a Node/Express TypeScript backend with Prisma ORM, and a React + Vite TypeScript frontend.

Requirements
- Docker & Docker Compose (recommended) or Node 18+ and Postgres locally
- If using AI: OpenAI API key (set OPENAI_API_KEY)

Run with Docker (recommended)
1. Copy .env.example to .env and fill values
2. docker-compose up --build
3. Backend: http://localhost:4000
4. Frontend: http://localhost:3000

Run locally without Docker
- Start Postgres
- From backend/: yarn && yarn dev
- From frontend/: yarn && yarn dev

Environment variables (.env)
- DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_grading
- OPENAI_API_KEY=optional_your_openai_key
- PORT=4000

Project layout
- backend/           (Express + TypeScript + Prisma)
- frontend/          (React + TypeScript + Vite)
- docker-compose.yml
- README.md

Seed data
On first start, Prisma seed script loads sample students, lecturers, courses, GST exam and sample answers.

Support
If you want this pushed to a GitHub repository or want CI/CD and deployment (Vercel/Heroku), tell me and I'll create the GitHub repo and workflows.
