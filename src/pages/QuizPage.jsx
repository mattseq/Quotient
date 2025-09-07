import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, account } from '../appwrite';
import '../styles/QuizPage.css';

function QuizPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [player, setPlayer] = useState(null);

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
    async function fetchPlayer() {
      try {
        const user = await account.get();
        setPlayer(user);
      } catch {
        setPlayer(null);
      }
    }
    fetchQuizQuotes();
    fetchPlayer();
  }, [groupId]);

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx].trim().toLowerCase() === q.author.trim().toLowerCase()) correct++;
    });
    setScore(correct);
    setSaving(true);
    setError('');
    try {
      // Save result to Appwrite database
      const dbId = "main";
      const quizzesId = "quizzes";
      if (!player) throw new Error("Player not found");
      const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      await databases.createDocument(dbId, quizzesId, 'unique()', {
        groupId,
        player: player.$id,
        score: percentage
      });
    } catch (err) {
      setError(err.message || 'Failed to save result.');
    }
    setSaving(false);
  };

  if (loading) return <div className="quiz-page-container">Loading...</div>;
  if (questions.length === 0) return <div className="quiz-page-empty">No quotes available for quiz.</div>;

  return (
    <div className="quiz-page-container">
      <h2 className="quiz-page-title">Solo Quiz</h2>
      {score === null ? (
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
          <button type="submit" className="quiz-page-btn" disabled={saving}>{saving ? 'Saving...' : 'Submit Answers'}</button>
        </form>
      ) : (
        <>
          <div className="quiz-page-score">
            Your Score: {score} / {questions.length}
          </div>
          {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
          <button className="quiz-page-btn" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>Back to Menu</button>
        </>
      )}
    </div>
  );
}

export default QuizPage;
