import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { databases } from '../appwrite';
import '../styles/QuizPage.css';

function QuizPage() {
  const { groupId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizQuotes() {
      try {
  const dbId = "main";
  const quotesId = "quotes";
  const groupsId = "groups";
  // Get group to access quoteBank
  const groupRes = await databases.getDocument(dbId, groupsId, groupId);
  // Fetch all quotes
  const quotesRes = await databases.listDocuments(dbId, quotesId);
  // Only quotes in group's quoteBank
  const groupQuotes = quotesRes.documents.filter(q => Array.isArray(groupRes.quoteBank) && groupRes.quoteBank.includes(q.$id));
  const shuffled = groupQuotes.sort(() => 0.5 - Math.random());
  setQuestions(shuffled.slice(0, 15));
  setAnswers(Array(shuffled.slice(0, 15).length).fill(''));
      } catch (err) {
        setQuestions([]);
      }
      setLoading(false);
    }
    fetchQuizQuotes();
  }, [groupId]);

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx].trim().toLowerCase() === q.author.trim().toLowerCase()) correct++;
    });
    setScore(correct);
  };

  if (loading) return <div className="quiz-page-container">Loading...</div>;
  if (questions.length === 0) return <div className="quiz-page-empty">No quotes available for quiz.</div>;

  return (
    <div className="quiz-page-container">
      <h2 className="quiz-page-title">Solo Quiz</h2>
      <form className="quiz-page-form" onSubmit={handleSubmit}>
        {questions.map((q, idx) => (
          <div key={q.$id} className="quiz-page-question">
            <div>{q.text}</div>
            <input
              type="text"
              placeholder="Type the author..."
              value={answers[idx]}
              onChange={e => handleChange(idx, e.target.value)}
              className="quiz-page-input"
              required
            />
          </div>
        ))}
        <button type="submit" className="quiz-page-btn">Submit Answers</button>
      </form>
      {score !== null && (
        <div className="quiz-page-score">
          Your Score: {score} / {questions.length}
        </div>
      )}
    </div>
  );
}

export default QuizPage;
