import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, account } from '../appwrite';
import '../styles/QuizPage.css';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (loading) return <motion.div className="quiz-page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Loading...</motion.div>;
  if (questions.length === 0) return <motion.div className="quiz-page-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>No quotes available for quiz.</motion.div>;

  return (
    <motion.div className="quiz-page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.h2 className="quiz-page-title" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 80 }}>Solo Quiz</motion.h2>
      <AnimatePresence mode="wait">
        {score === null ? (
          <motion.form className="quiz-page-form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {questions.map((q, idx) => (
              <motion.div
                key={q.$id}
                className="quiz-page-question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                layout
              >
                <div className="quiz-page-question-text">{q.text}</div>
                <input
                  type="text"
                  placeholder="Type the author..."
                  value={answers[idx]}
                  onChange={e => handleChange(idx, e.target.value)}
                  className="quiz-page-input"
                  required
                />
              </motion.div>
            ))}
            <motion.button type="submit" className="quiz-page-btn" disabled={saving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              {saving ? 'Saving...' : 'Submit Answers'}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div key="score" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="quiz-page-score-container">
            <div className="quiz-page-score">
              Your Score: {score} / {questions.length}
            </div>
            {error && <div className="quiz-page-error">{error}</div>}
            <motion.button className="quiz-page-btn" onClick={() => navigate('/')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Back to Menu
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default QuizPage;
