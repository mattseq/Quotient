import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, account } from '../appwrite';
import { Query } from 'appwrite';
import '../styles/LeaderBoardPage.css';

function LeaderboardPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerNames, setPlayerNames] = useState({});

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError('');
      try {
        const dbId = 'main';
        const quizzesId = 'quizzes';
        // Get all quiz results for this group
        // Use Appwrite's Query.equal helper for filtering
        const res = await databases.listDocuments(dbId, quizzesId, [
          Query.equal('groupId', groupId)
        ]);
        // Sort by score descending, then by $createdAt ascending
        const sorted = res.documents.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.$createdAt) - new Date(b.$createdAt);
        });
        setResults(sorted);

        // Fetch player names/emails for unique player IDs
        const uniquePlayerIds = [...new Set(sorted.map(r => r.player))].filter(Boolean);
        const names = {};
        await Promise.all(uniquePlayerIds.map(async (id) => {
          try {
            const user = await account.get(id);
            names[id] = user.name || user.email || id;
          } catch {
            names[id] = id;
          }
        }));
        setPlayerNames(names);
      } catch (err) {
        setError('Failed to load leaderboard: ' + (err.message || 'Unknown error'));
        setResults([]);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, [groupId]);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <div className="leaderboard-divider" />
      <button className="leaderboard-btn" onClick={() => navigate(-1)}>
        Back to Group
      </button>
      {loading ? (
        <div className="leaderboard-empty">Loading...</div>
      ) : error ? (
        <div className="leaderboard-empty" style={{ color: 'red' }}>{error}</div>
      ) : results.length === 0 ? (
        <div className="leaderboard-empty">No quiz results yet.</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Score (%)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.$id}>
                <td>{playerNames[r.player] || 'Unknown'}</td>
                <td>{r.score}</td>
                <td>{new Date(r.$createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaderboardPage;
