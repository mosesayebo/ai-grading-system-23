import { Configuration, OpenAIApi } from 'openai';

type GradeRequest = {
  prompt?: string;
  modelAnswer: string;
  studentAnswer: string;
  courseTitle?: string;
};

type GradeResponse = {
  score: number;
  similarity: number;
  keywordMatchRatio: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  performanceLevel: 'Excellent'| 'Very Good'| 'Good' | 'Fair' | 'Poor';
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function termFrequency(tokens: string[]) {
  const tf: Record<string, number> = {};
  tokens.forEach(t => tf[t] = (tf[t] || 0) + 1);
  const len = tokens.length || 1;
  Object.keys(tf).forEach(k => tf[k] = tf[k] / len);
  return tf;
}

function inverseDocumentFrequency(docsTokens: string[][]) {
  const N = docsTokens.length;
  const df: Record<string, number> = {};
  docsTokens.forEach(tokens => {
    const seen = new Set<string>();
    tokens.forEach(t => seen.add(t));
    Array.from(seen).forEach(t => df[t] = (df[t] || 0) + 1);
  });
  const idf: Record<string, number> = {};
  Object.keys(df).forEach(k => idf[k] = Math.log( (N + 1) / (df[k] + 1) ) + 1 );
  return idf;
}

function tfidfVector(tokens: string[], idf: Record<string, number>) {
  const tf = termFrequency(tokens);
  const vec: Record<string, number> = {};
  Object.keys(tf).forEach(term => vec[term] = tf[term] * (idf[term] || 0));
  return vec;
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>) {
  let dot = 0, suma = 0, sumb = 0;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.forEach(k => {
    const va = a[k] || 0;
    const vb = b[k] || 0;
    dot += va * vb;
    suma += va * va;
    sumb += vb * vb;
  });
  if (suma === 0 || sumb === 0) return 0;
  return dot / (Math.sqrt(suma) * Math.sqrt(sumb));
}

function extractKeywords(tokens: string[], top = 12) {
  const freq: Record<string, number> = {};
  tokens.forEach(t => { if (t.length <= 3) return; freq[t] = (freq[t] || 0) + 1; });
  const keys = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0, top);
  return keys;
}

function performanceLevel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

export async function gradeWithNLP(payload: GradeRequest): Promise<GradeResponse> {
  const model = payload.modelAnswer || '';
  const student = payload.studentAnswer || '';
  const modelTokens = tokenize(model);
  const studentTokens = tokenize(student);

  const keywords = extractKeywords(modelTokens, 20);
  let matched = 0;
  keywords.forEach(k => { if (studentTokens.includes(k)) matched += 1; });
  const kwRatio = keywords.length ? matched / keywords.length : 0;

  const docs = [modelTokens, studentTokens];
  const idf = inverseDocumentFrequency(docs);
  const vecA = tfidfVector(modelTokens, idf);
  const vecB = tfidfVector(studentTokens, idf);
  let cos = cosineSimilarity(vecA, vecB);

  const lenScore = Math.min(1, Math.max(0, student.length / Math.max(200, model.length || 200)));

  const paras = Math.max(1, (student.split(/\n\n+/).length));
  const paraBonus = Math.min(0.15, Math.log(1 + paras) / 5);

  let combined = cos * 0.55 + kwRatio * 0.25 + lenScore * 0.10 + paraBonus * 0.10;
  combined = Math.min(1, Math.max(0, combined));
  const score = Math.round(combined * 100);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (kwRatio >= 0.7) strengths.push('Covers most key terms and concepts from the model answer.');
  if (cos >= 0.7) strengths.push('High overall content similarity and topical alignment.');
  if (student.length >= Math.max(200, model.length * 0.8)) strengths.push('Sufficient answer length and detail.');

  if (kwRatio < 0.4) weaknesses.push('Misses important keywords from the model answer.');
  if (cos < 0.4) weaknesses.push('Overall content appears off-topic or missing major components.');
  if (student.length < 100) weaknesses.push('Answer is too short; expand with examples and explanations.');

  const fbLines: string[] = [];
  fbLines.push(`Similarity: ${(cos * 100).toFixed(1)}%. Keyword match: ${(kwRatio * 100).toFixed(0)}%.`);
  if (strengths.length) fbLines.push('Strengths: ' + strengths.join(' '));
  if (weaknesses.length) fbLines.push('Areas to improve: ' + weaknesses.join(' '));
  fbLines.push('Recommendation: Add more detailed explanation, clear examples and reference key terms.');
  const feedback = fbLines.join(' ');

  return { score, similarity: Math.round(cos * 100), keywordMatchRatio: Math.round(kwRatio * 100), feedback, strengths, weaknesses, performanceLevel: performanceLevel(score) };
}

export async function gradeAnswer(payload: GradeRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return gradeWithNLP(payload);
  }

  const local = await gradeWithNLP(payload);
  try {
    const cfg = new Configuration({ apiKey: key });
    const client = new OpenAIApi(cfg);

    const system = `You are an experienced university lecturer and grading assistant. Given a model answer and a student's answer, produce:\n1) A short \"feedback\" paragraph of at most 150 words.\n2) 3 bullet strengths.\n3) 3 bullet weaknesses.\n4) A JSON object with keys: suggestedScore (number 0-100) and feedback (string), strengths (string[]), weaknesses (string[]). Do NOT print anything else.`;

    const content = [
      `Model Answer:\n${payload.modelAnswer}\n\nStudent Answer:\n${payload.studentAnswer}`,
      `LocalMetrics:\nsimilarity=${local.similarity}%, keywordMatch=${local.keywordMatchRatio}%, localScore=${local.score}\n`
    ].join('\n');

    const resp = await client.createChatCompletion({ model: 'gpt-4o-mini', messages: [ { role: 'system', content: system }, { role: 'user', content } ], max_tokens: 400, temperature: 0.2 });

    const out = resp.data.choices?.[0].message?.content || '';
    const jsonMatch = out.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const suggested = Number(parsed.suggestedScore || parsed.score || local.score);
        const blendedScore = Math.round((local.score * 0.7) + (suggested * 0.3));
        return { score: blendedScore, similarity: local.similarity, keywordMatchRatio: local.keywordMatchRatio, feedback: parsed.feedback || local.feedback, strengths: parsed.strengths || local.strengths, weaknesses: parsed.weaknesses || local.weaknesses, performanceLevel: performanceLevel(blendedScore) };
      } catch (e) {}
    }
    return local;
  } catch (e) {
    console.error('OpenAI grading error, using local grader', e);
    return local;
  }
}
