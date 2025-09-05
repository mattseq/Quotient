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
      if (onGroupCreated) onGroupCreated();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-quote-container">
      <button className="group-page-btn" onClick={() => setShowForm(true)}>
        Add Quote
      </button>
      {showForm && (
        <div className="add-quote-modal" onClick={e => {
          if (e.target.classList.contains('add-quote-modal')) setShowForm(false);
        }}>
          <div className="add-quote-modal-content">
            <h3 className="add-quote-title">Add a Quote</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                placeholder="Quote text"
                value={text}
                onChange={e => setText(e.target.value)}
                required
                className="add-quote-textarea"
                rows={5}
                style={{ width: '100%', resize: 'vertical', fontSize: '1.1rem', marginBottom: '1rem' }}
              />
              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
                className="add-quote-input"
              />
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={loading} className="group-page-btn">
                  {loading ? 'Adding...' : 'Add Quote'}
                </button>
                <button type="button" className="add-quote-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
            {error && <div className="add-quote-error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupPage({ groupId }) {
  const [quotes, setQuotes] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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

  // Edit quote handler
  const handleEditClick = (quote) => {
    setEditingQuoteId(quote.$id);
    setEditText(quote.text);
    setEditAuthor(quote.author);
    setEditError('');
  };

  const handleEditCancel = () => {
    setEditingQuoteId(null);
    setEditText('');
    setEditAuthor('');
    setEditError('');
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      await databases.updateDocument("main", "quotes", editingQuoteId, {
        text: editText,
        author: editAuthor
      });
      setEditingQuoteId(null);
      setEditText('');
      setEditAuthor('');
      await fetchGroupAndQuotes();
    } catch (err) {
      setEditError(err.message);
    }
    setEditLoading(false);
  };

  return (
    <div className="group-page-container">
      <h2 className="group-page-title">{group.name}</h2>
      <div className="group-page-top-buttons">
        <button className="group-page-btn" onClick={() => window.location.href = `/quiz/${groupId}`}>Quiz</button>
        <button className="group-page-btn" style={{ marginLeft: '1rem' }}>Leaderboard</button>
      </div>
      <div className="group-page-quotes-header">
        <h3 className="group-page-title">Quotes</h3>
        <AddQuote groupId={groupId} onQuoteAdded={fetchGroupAndQuotes} />
      </div>
      <div className="group-page-divider" />
      <div className="group-page-quotes-section" style={{ flexGrow: 1 }}>
        <ul className="group-page-quotes-list">
          {quotes.length === 0 ? (
            <li className="group-page-empty">No quotes in this group.</li>
          ) : (
            quotes.map(q => (
              <li key={q.$id} className="group-page-quote-item">
                {editingQuoteId === q.$id ? (
                  // Edit form replaces quote content, not nested
                  <>
                    <textarea
                      className="edit-quote-input"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={3}
                    />
                    <input
                      className="edit-quote-input"
                      type="text"
                      value={editAuthor}
                      onChange={e => setEditAuthor(e.target.value)}
                    />
                    <div>
                      <button onClick={handleEditSave} disabled={editLoading} className="group-page-btn" style={{ marginRight: '1rem' }}>
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={handleEditCancel} className="group-page-btn">Cancel</button>
                    </div>
                    {editError && <div className="add-quote-error">{editError}</div>}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span>{q.text}</span>
                      <span className="group-page-quote-author">— {q.author}</span>
                    </div>
                    <button
                      className="group-page-btn"
                      onClick={() => handleEditClick(q)}
                    >Edit</button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default GroupPage;
