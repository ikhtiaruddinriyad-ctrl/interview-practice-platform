import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { askGroq } from "./groqClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Interview Practice Platform API is running.");
});

app.get("/test-groq", async (req, res) => {
  try {
    const reply = await askGroq([
      { role: "user", content: "Say hello in one short sentence." },
    ]);
    res.send(reply);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong: " + err.message);
  }
});

app.post("/api/generate-questions", async (req, res) => {
  try {
    const { sector, jobRole } = req.body;

    if (!sector) {
      return res.status(400).json({ error: "sector is required" });
    }

    const prompt = `You are an expert interviewer for the "${sector}" field${jobRole ? ` (specific role: ${jobRole})` : ""}.

Generate exactly 8 interview questions relevant to this sector, following this EXACT pattern for question types, repeated twice (8 questions total):
1. MCQ (multiple choice, 4 options)
2. Open-ended (HR or scenario-based)
3. Open-ended (Technical/domain knowledge)
4. True/False

Rules:
- MCQ questions must have exactly 4 options and one correct answer.
- True/False questions must have a clear factual correct answer (true or false).
- Open-ended questions do not have a fixed correct answer — they will be evaluated qualitatively later.
- Base questions on real knowledge/scenarios specific to "${sector}".

Return ONLY valid JSON, no extra text, in this exact shape:
{
  "questions": [
    { "id": 1, "questionType": "mcq", "type": "Technical", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "B" },
    { "id": 2, "questionType": "open", "type": "HR", "question": "..." },
    { "id": 3, "questionType": "open", "type": "Technical", "question": "..." },
    { "id": 4, "questionType": "true_false", "type": "Technical", "question": "...", "correctAnswer": true },
    { "id": 5, "questionType": "mcq", "type": "Technical", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" },
    { "id": 6, "questionType": "open", "type": "HR", "question": "..." },
    { "id": 7, "questionType": "open", "type": "Technical", "question": "..." },
    { "id": 8, "questionType": "true_false", "type": "Technical", "question": "...", "correctAnswer": false }
  ]
}`;

    const raw = await askGroq([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate questions", detail: err.message });
  }
});

app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { question, answerText } = req.body;

    if (!question || !answerText) {
      return res.status(400).json({ error: "question and answerText are required" });
    }

    const prompt = `You are an interview coach evaluating a candidate's spoken answer (transcribed from speech, so minor grammar issues should be ignored).

Question: ${question}
Candidate's Answer: ${answerText}

Evaluate the answer and return ONLY valid JSON, no extra text, in this exact shape:
{
  "score": 7,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "note": "one short encouraging sentence"
}`;

    const raw = await askGroq([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate answer", detail: err.message });
  }
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});