import { getDatabase } from "@netlify/database";

const db = getDatabase();

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

const notFound = () => json({ error: "Not found" }, 404);
const badRequest = (message) => json({ error: message }, 400);

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function performanceLevel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
}

function gradeWithNLP({ modelAnswer = "", studentAnswer = "" }) {
  const modelTokens = tokenize(modelAnswer);
  const studentTokens = tokenize(studentAnswer);
  const modelSet = new Set(modelTokens);
  const studentSet = new Set(studentTokens);
  const shared = [...modelSet].filter((term) => studentSet.has(term));
  const similarity = modelSet.size ? shared.length / modelSet.size : 0;
  const lengthScore = Math.min(1, studentAnswer.length / Math.max(180, modelAnswer.length || 180));
  const score = Math.round(Math.min(1, similarity * 0.72 + lengthScore * 0.28) * 100);
  const strengths = [];
  const weaknesses = [];

  if (similarity >= 0.6) strengths.push("Covers many of the expected concepts.");
  if (studentAnswer.length >= 180) strengths.push("Provides enough detail for assessment.");
  if (similarity < 0.4) weaknesses.push("Misses several important ideas from the model answer.");
  if (studentAnswer.length < 100) weaknesses.push("Answer is too brief and needs more explanation.");

  const feedback = [
    `Similarity: ${Math.round(similarity * 100)}%.`,
    strengths.length ? `Strengths: ${strengths.join(" ")}` : "",
    weaknesses.length ? `Areas to improve: ${weaknesses.join(" ")}` : "",
    "Recommendation: add clearer examples and include more of the core terms from the model answer."
  ].filter(Boolean).join(" ");

  return {
    score,
    similarity: Math.round(similarity * 100),
    keywordMatchRatio: Math.round(similarity * 100),
    feedback,
    strengths,
    weaknesses,
    performanceLevel: performanceLevel(score)
  };
}

async function bodyJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function seedIfEmpty() {
  const [count] = await db.sql`SELECT COUNT(*)::int AS count FROM courses`;
  if (count.count > 0) return;

  const [lecturer] = await db.sql`
    INSERT INTO lecturers (name, email, department)
    VALUES (${"Dr. Olufemi Akinyemi"}, ${"lecturer@leadcity.edu.ng"}, ${"Software Engineering"})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  const courseValues = db.sql.values([
    ["GST107", "Use of English", 2, lecturer.id],
    ["IGST114", "Human Geography of Nigeria", 2, lecturer.id],
    ["GST115", "Nigerian People and Culture", 2, lecturer.id],
    ["GST211", "Peace and Conflict Resolution", 2, lecturer.id],
    ["GST213", "Entrepreneurship", 2, lecturer.id],
    ["GST316", "ICT", 2, lecturer.id],
    ["GST317", "Entrepreneurial Skill Acquisition", 2, lecturer.id]
  ]);
  await db.sql`
    INSERT INTO courses (code, title, credits, lecturer_id)
    VALUES ${courseValues}
    ON CONFLICT (code) DO NOTHING
  `;

  const studentValues = db.sql.values([
    ["LCU/UG/22/23017", "Adewale Gbolahan Okikiola", "Software Engineering", "adewale@example.com", "200"],
    ["LCU/UG/22/23018", "Mariam Adebisi Falade", "Computer Science", "mariam.falade@example.com", "200"]
  ]);
  await db.sql`
    INSERT INTO students (matric, name, department, email, level)
    VALUES ${studentValues}
    ON CONFLICT (matric) DO NOTHING
  `;

  const [course] = await db.sql`SELECT id FROM courses WHERE code = ${"GST107"} LIMIT 1`;
  if (course) {
    await db.sql`
      INSERT INTO exams (course_id, title, prompt, model_answer)
      VALUES (
        ${course.id},
        ${"GST107 - Use of English - Sample Exam"},
        ${"Write a 250-word essay on the benefits of education."},
        ${"Education broadens perspectives, develops communication skills, improves employment prospects, and helps people contribute responsibly to society."}
      )
    `;
  }
}

async function listCourses() {
  await seedIfEmpty();
  return db.sql`
    SELECT c.id, c.code, c.title, c.credits, c.semester,
      json_build_object('id', l.id, 'name', l.name, 'email', l.email, 'department', l.department) AS lecturer
    FROM courses c
    LEFT JOIN lecturers l ON l.id = c.lecturer_id
    ORDER BY c.code
  `;
}

async function listStudents() {
  await seedIfEmpty();
  return db.sql`
    SELECT id, matric, name, department, email, level, created_at AS "createdAt"
    FROM students
    ORDER BY name
  `;
}

async function listExams() {
  await seedIfEmpty();
  return db.sql`
    SELECT e.id, e.title, e.prompt, e.model_answer AS "modelAnswer", e.semester, e.created_at AS "createdAt",
      json_build_object('id', c.id, 'code', c.code, 'title', c.title, 'credits', c.credits) AS course
    FROM exams e
    JOIN courses c ON c.id = e.course_id
    ORDER BY e.created_at DESC
  `;
}

async function listResults() {
  await seedIfEmpty();
  return db.sql`
    SELECT r.id, r.student_id AS "studentId", r.exam_id AS "examId", r.score, r.grade, r.feedback, r.created_at AS "createdAt",
      json_build_object('id', s.id, 'matric', s.matric, 'name', s.name, 'department', s.department, 'email', s.email, 'level', s.level) AS student,
      json_build_object('id', e.id, 'title', e.title, 'prompt', e.prompt, 'course', json_build_object('id', c.id, 'code', c.code, 'title', c.title, 'credits', c.credits)) AS exam
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN exams e ON e.id = r.exam_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY r.created_at DESC
  `;
}

async function handleStudents(req, parts) {
  if (req.method === "GET" && parts.length === 1) return json(await listStudents());
  if (req.method === "POST" && parts.length === 1) {
    const data = await bodyJson(req);
    if (!data.matric || !data.name || !data.department) return badRequest("matric, name and department are required");
    const [student] = await db.sql`
      INSERT INTO students (matric, name, department, email, level)
      VALUES (${data.matric}, ${data.name}, ${data.department}, ${data.email || null}, ${data.level || null})
      RETURNING id, matric, name, department, email, level, created_at AS "createdAt"
    `;
    return json(student, 201);
  }
  if (parts.length === 2) {
    const id = Number(parts[1]);
    if (req.method === "PUT") {
      const data = await bodyJson(req);
      const [student] = await db.sql`
        UPDATE students
        SET matric = ${data.matric}, name = ${data.name}, department = ${data.department}, email = ${data.email || null}, level = ${data.level || null}
        WHERE id = ${id}
        RETURNING id, matric, name, department, email, level, created_at AS "createdAt"
      `;
      return student ? json(student) : notFound();
    }
    if (req.method === "DELETE") {
      await db.sql`DELETE FROM students WHERE id = ${id}`;
      return json({ ok: true });
    }
  }
  return notFound();
}

async function handleExams(req, parts) {
  if (req.method === "GET" && parts.length === 1) return json(await listExams());
  if (req.method === "POST" && parts.length === 1) {
    const data = await bodyJson(req);
    if (!data.courseId || !data.title) return badRequest("courseId and title are required");
    const [exam] = await db.sql`
      INSERT INTO exams (course_id, title, prompt, model_answer, semester)
      VALUES (${Number(data.courseId)}, ${data.title}, ${data.prompt || ""}, ${data.modelAnswer || ""}, ${data.semester || null})
      RETURNING id, title, prompt, model_answer AS "modelAnswer", semester, created_at AS "createdAt"
    `;
    return json(exam, 201);
  }
  if (req.method === "POST" && parts.length === 3 && parts[2] === "upload-and-grade") {
    const examId = Number(parts[1]);
    let studentId;
    let studentAnswer = "";
    if ((req.headers.get("content-type") || "").includes("multipart/form-data")) {
      const form = await req.formData();
      studentId = Number(form.get("studentId"));
      const script = form.get("script");
      studentAnswer = script && typeof script.text === "function" ? await script.text() : "";
    } else {
      const data = await bodyJson(req);
      studentId = Number(data.studentId);
      studentAnswer = data.studentText || data.studentAnswer || "";
    }
    if (!studentId || !studentAnswer) return badRequest("studentId and answer are required");

    const [exam] = await db.sql`
      SELECT e.id, e.prompt, e.model_answer AS "modelAnswer", c.title AS "courseTitle"
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = ${examId}
    `;
    if (!exam) return notFound();

    const grading = gradeWithNLP({ modelAnswer: exam.modelAnswer || exam.prompt, studentAnswer });
    const [result] = await db.sql`
      INSERT INTO results (student_id, exam_id, score, grade, feedback)
      VALUES (${studentId}, ${examId}, ${grading.score}, ${gradeFromScore(grading.score)}, ${grading.feedback})
      RETURNING id, student_id AS "studentId", exam_id AS "examId", score, grade, feedback, created_at AS "createdAt"
    `;
    return json({ result, grading }, 201);
  }
  return notFound();
}

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const apiPath = url.pathname
      .replace(/^\/api\/?/, "")
      .replace(/^\/\.netlify\/functions\/api\/?/, "");
    const parts = apiPath.split("/").filter(Boolean);
    const resource = parts[0] || "health";

    if (resource === "health") return json({ ok: true });
    if (resource === "students") return handleStudents(req, parts);
    if (resource === "courses" && req.method === "GET") return json(await listCourses());
    if (resource === "exams") return handleExams(req, parts);
    if (resource === "results" && req.method === "GET") return json(await listResults());
    if (resource === "local" && parts[1] === "grade" && req.method === "POST") {
      const data = await bodyJson(req);
      if (!data.modelAnswer || !data.studentAnswer) return badRequest("modelAnswer and studentAnswer are required");
      return json(gradeWithNLP(data));
    }
    if (resource === "analytics" && parts[1] === "average-performance") {
      const [row] = await db.sql`SELECT AVG(score)::float AS avg_score FROM results`;
      return json([row || { avg_score: 0 }]);
    }
    if (resource === "analytics" && parts[1] === "grade-distribution") {
      return json(await db.sql`SELECT grade, COUNT(*)::int AS count FROM results GROUP BY grade ORDER BY grade`);
    }
    if (resource === "analytics" && parts[1] === "pass-fail") {
      const [row] = await db.sql`
        SELECT
          SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END)::int AS pass_count,
          SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END)::int AS fail_count
        FROM results
      `;
      return json([row || { pass_count: 0, fail_count: 0 }]);
    }
    return notFound();
  } catch (error) {
    console.error(error);
    return json({ error: "Server error" }, 500);
  }
}
