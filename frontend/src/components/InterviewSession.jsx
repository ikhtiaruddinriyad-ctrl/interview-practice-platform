import { useState } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

function InterviewSession({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [collectedAnswers, setCollectedAnswers] = useState([]);

  const { isListening, transcript, startListening, stopListening, setTranscript } =
    useSpeechRecognition();

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // ---- MCQ / True-False submit (checked instantly, no AI call needed) ----
  const handleSelectOption = (option) => {
    if (feedback) return; // already answered, don't allow changing
    setSelectedOption(option);

    const isCorrect = option === currentQuestion.correctAnswer;
    const localFeedback = {
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
    };
    setFeedback(localFeedback);

    setCollectedAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        type: currentQuestion.type,
        questionType: currentQuestion.questionType,
        answerText: String(option),
        isCorrect,
      },
    ]);
  };

  // ---- Open-ended submit (goes through AI evaluation) ----
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5050/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          answerText: transcript,
        }),
      });
      const data = await response.json();
      setFeedback(data);

      setCollectedAnswers((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          type: currentQuestion.type,
          questionType: currentQuestion.questionType,
          answerText: transcript,
          feedback: data,
        },
      ]);
    } catch (err) {
      console.error("Error evaluating answer:", err);
      alert("Something went wrong evaluating your answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setTranscript("");
    setFeedback(null);
    setSelectedOption(null);

    if (isLastQuestion) {
      onFinish(collectedAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Helper to decide button styling for MCQ/True-False options
  const getOptionClass = (option) => {
    if (!feedback) return "option-button";
    if (option === currentQuestion.correctAnswer) return "option-button correct";
    if (option === selectedOption) return "option-button incorrect";
    return "option-button";
  };

  return (
    <div className="card">
        <div className="progress-track">
  <div
    className="progress-fill"
    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
   />
  </div>
      <span className="badge">
        Question {currentIndex + 1} of {questions.length} · {currentQuestion.type}
      </span>
      <h3>{currentQuestion.question}</h3>

      {/* ---- MCQ UI ---- */}
      {currentQuestion.questionType === "mcq" && (
        <div>
          {currentQuestion.options.map((opt, i) => {
            const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
            return (
              <button
                key={i}
                className={getOptionClass(optionLetter)}
                onClick={() => handleSelectOption(optionLetter)}
                disabled={!!feedback}
              >
                {optionLetter}. {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- True/False UI ---- */}
      {currentQuestion.questionType === "true_false" && (
        <div>
          <button
            className={getOptionClass(true)}
            onClick={() => handleSelectOption(true)}
            disabled={!!feedback}
          >
            True
          </button>
          <button
            className={getOptionClass(false)}
            onClick={() => handleSelectOption(false)}
            disabled={!!feedback}
          >
            False
          </button>
        </div>
      )}

      {/* ---- Open-ended UI (voice or text) ---- */}
      {currentQuestion.questionType === "open" && (
        <div>
          <button
            className={`mic-button ${isListening ? "listening" : ""}`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? "⏹ Stop Recording" : "🎙 Start Answering"}
          </button>

          <label>Your Answer (speak or type)</label>
          <textarea
            className="transcript-box"
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click 'Start Answering' to speak, or type your answer here..."
          />

          {!feedback && (
            <button onClick={handleSubmitAnswer} disabled={submitting || !transcript.trim()}>
             {submitting ? (
              <span className="loading-text">
              <span className="spinner"></span>
                Evaluating...
              </span>
           ) : (
          "Submit Answer"
           )}
           </button>
          )}
        </div>
      )}

      {/* ---- Feedback display ---- */}
      {feedback && (
        <div className="feedback-box">
          {currentQuestion.questionType === "open" ? (
            <>
              <div className="score-badge">{feedback.score}/10</div>
              <p><strong>Strengths:</strong></p>
              <ul>
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p><strong>Improvements:</strong></p>
              <ul>
                {feedback.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p style={{ fontStyle: "italic", color: "#94a3b8" }}>{feedback.note}</p>
            </>
          ) : (
            <p>
              {feedback.isCorrect ? "✅ Correct!" : "❌ Incorrect."}{" "}
              {!feedback.isCorrect && (
                <span>Correct answer: <strong>{String(feedback.correctAnswer)}</strong></span>
              )}
            </p>
          )}

          <button onClick={handleNext}>
            {isLastQuestion ? "Finish & See Report" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewSession;