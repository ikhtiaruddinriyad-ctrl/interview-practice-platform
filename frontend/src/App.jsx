import { useState } from "react";
import SetupForm from "./components/SetupForm";
import InterviewSession from "./components/InterviewSession";
import FeedbackReport from "./components/FeedbackReport";

function App() {
  const [questions, setQuestions] = useState(null);
  const [collectedAnswers, setCollectedAnswers] = useState(null);

  const handleQuestionsReady = (generatedQuestions) => {
    setQuestions(generatedQuestions);
  };

  const handleInterviewFinish = (answers) => {
    setCollectedAnswers(answers);
  };

  const handleRestart = () => {
    setQuestions(null);
    setCollectedAnswers(null);
  };

  return (
    <div className="container">
      <h1>🎙 Interview Practice Platform</h1>
      <p className="tagline">Give your answer, get instant feedback</p>

      {!questions && <SetupForm onQuestionsReady={handleQuestionsReady} />}

      {questions && !collectedAnswers && (
        <InterviewSession questions={questions} onFinish={handleInterviewFinish} />
      )}

      {collectedAnswers && (
        <FeedbackReport collectedAnswers={collectedAnswers} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;