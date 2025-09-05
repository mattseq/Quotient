import React, { useEffect, useState } from 'react';
import { databases, account } from '../appwrite';
import '../styles/GroupPage.css';

function AddQuote({ groupId, onQuoteAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await account.get();
      const quote = await databases.createDocument("main", "quotes", 'unique()', {
        text,
        author,
        createdBy: user.$id,
        groupId
      });
      // Add quote to group's quoteBank
      const group = await databases.getDocument("main", "groups", groupId);
      const updatedBank = Array.isArray(group.quoteBank) ? [...group.quoteBank, quote.$id] : [quote.$id];
      await databases.updateDocument("main", "groups", groupId, { quoteBank: updatedBank });
      setText('');
      setAuthor('');
      setShowForm(false);
      if (onQuoteAdded) onQuoteAdded();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-quote-container">
      {!showForm ? (
        <button className="add-quote-btn" onClick={() => setShowForm(true)}>
          Add Quote
        </button>
      ) : (
        <div className="add-quote-form">
          <h3 className="add-quote-title">Add a Quote</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Quote text"
              value={text}
              onChange={e => setText(e.target.value)}
              required
              className="add-quote-input"
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              required
              className="add-quote-input"
            />
            <button type="submit" disabled={loading} className="add-quote-btn">
              {loading ? 'Adding...' : 'Add Quote'}
            </button>
            <button type="button" className="add-quote-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
          {error && <div className="add-quote-error">{error}</div>}
        </div>
      )}
    </div>
  );
}

function GroupPage({ groupId }) {
  const [quotes, setQuotes] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupAndQuotes = async () => {
    try {
      const dbId = "main";
      const groupsId = "groups";
      const quotesId = "quotes";
      const groupRes = await databases.getDocument(dbId, groupsId, groupId);
      setGroup(groupRes);
      // Fetch quotes for this group
      const quotesRes = await databases.listDocuments(dbId, quotesId);
      setQuotes(quotesRes.documents.filter(q => Array.isArray(groupRes.quoteBank) && groupRes.quoteBank.includes(q.$id)));
    } catch (err) {
      setQuotes([]);
      setGroup(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroupAndQuotes();
  }, [groupId]);

  if (loading) return <div className="group-page-container">Loading...</div>;
  if (!group) return <div className="group-page-empty">Group not found.</div>;

  return (
    <div className="group-page-container">
      <h2 className="group-page-title">{group.name}</h2>
      {/* Quiz button removed for now, can be added to main area if needed */}
      <AddQuote groupId={groupId} onQuoteAdded={fetchGroupAndQuotes} />
      <h3 className="group-page-title">Quotes</h3>
      <ul className="group-page-quotes-list">
        {quotes.length === 0 ? (
          <li className="group-page-empty">No quotes in this group.</li>
        ) : (
          quotes.map(q => (
            <li key={q.$id} className="group-page-quote-item">
              <span>{q.text}</span>
              <span className="group-page-quote-author">— {q.author}</span>
            </li>
          ))
        )}
      </ul>
      {/* Leaderboard placeholder */}
      <h3 className="group-page-leaderboard-title">Leaderboard</h3>
      <div className="group-page-leaderboard-placeholder">Coming soon!</div>
    </div>
  );
}

export default GroupPage;
