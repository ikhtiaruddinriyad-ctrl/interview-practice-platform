function FeedbackReport({ collectedAnswers, onRestart }) {
  // Open-ended প্রশ্নগুলোর score দিয়ে average বের করছি
  const openEndedAnswers = collectedAnswers.filter((item) => item.questionType === "open");
  const totalOpenScore = openEndedAnswers.reduce((sum, item) => sum + item.feedback.score, 0);
  const avgOpenScore = openEndedAnswers.length
    ? (totalOpenScore / openEndedAnswers.length).toFixed(1)
    : null;

  // MCQ/True-False প্রশ্নগুলোর কতগুলো সঠিক হয়েছে
  const objectiveAnswers = collectedAnswers.filter((item) => item.questionType !== "open");
  const correctCount = objectiveAnswers.filter((item) => item.isCorrect).length;

  return (
    <div className="card">
      <h2>Interview Report</h2>

      <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
        {avgOpenScore !== null && (
          <div>
            <div className="score-badge">{avgOpenScore}/10</div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Avg. score ({openEndedAnswers.length} open questions)
            </p>
          </div>
        )}
        {objectiveAnswers.length > 0 && (
          <div>
            <div className="score-badge">
              {correctCount}/{objectiveAnswers.length}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>MCQ / True-False correct</p>
          </div>
        )}
      </div>

      {collectedAnswers.map((item, index) => (
        <div key={index} className="feedback-box" style={{ marginTop: "1rem" }}>
          <span className="badge">Q{index + 1} · {item.type}</span>
          <p style={{ marginTop: "0.5rem" }}>{item.question}</p>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
            <strong>Your answer:</strong> {item.answerText}
          </p>

          {item.questionType === "open" ? (
            <p style={{ marginTop: "0.5rem" }}>
              <strong>Score:</strong> {item.feedback.score}/10
            </p>
          ) : (
            <p style={{ marginTop: "0.5rem" }}>
              {item.isCorrect ? "✅ Correct" : "❌ Incorrect"}
            </p>
          )}
        </div>
      ))}

      <button onClick={onRestart}>Start New Interview</button>
    </div>
  );
}

export default FeedbackReport;