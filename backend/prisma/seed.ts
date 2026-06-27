import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // Lecturer
  const lecturer = await prisma.lecturer.upsert({
    where: { email: 'lecturer@leadcity.edu.ng' },
    update: {},
    create: {
      name: 'Dr. John Doe',
      email: 'lecturer@leadcity.edu.ng',
      department: 'Software Engineering',
    },
  });

  // Courses (GST list)
  const gstCourses = [
    { code: 'GST107', title: 'Use of English' },
    { code: 'IGST114', title: 'Human Geography of Nigeria' },
    { code: 'GST115', title: 'Nigerian People and Culture' },
    { code: 'GST211', title: 'Peace and Conflict Resolution' },
    { code: 'GST213', title: 'Entrepreneurship' },
    { code: 'GST316', title: 'ICT' },
    { code: 'GST317', title: 'Entrepreneurial Skill Acquisition' },
  ];

  for (const c of gstCourses) {
    await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        title: c.title,
        credits: 2,
        lecturerId: lecturer.id,
      },
    });
  }

  // Students
  const students = [
    { matric: 'LCU/UG/22/23017', name: 'Adewale Gbolahan Okikiola', department: 'Software Engineering', email: 'adewale@example.com', level: '200' },
    { matric: 'LCU/UG/22/23018', name: 'Sample Student 2', department: 'Computer Science', email: 'student2@example.com', level: '200' }
  ];

  for (const s of students) {
    await prisma.student.upsert({
      where: { matric: s.matric },
      update: {},
      create: s
    });
  }

  // Create a sample exam for Use of English
  const course = await prisma.course.findUnique({ where: { code: 'GST107' }});
  if (course) {
    await prisma.exam.upsert({
      where: { title: 'GST107 - Use of English - Sample Exam' },
      update: {},
      create: {
        courseId: course.id,
        title: 'GST107 - Use of English - Sample Exam',
        prompt: 'Write a 250-word essay on the benefits of education.',
        modelAnswer: 'Education broadens perspectives, improves employment prospects, ...'
      }
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
