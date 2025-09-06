import React, { useEffect, useState } from 'react';
import { databases, account, client } from '../appwrite';
import { ID } from 'appwrite';
import '../styles/GroupPage.css';
import { FaEdit, FaTrash, FaTrophy, FaClipboardList, FaPlus } from 'react-icons/fa';

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
    <>
      <li
        className="group-page-quote-item group-page-add-quote-item"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontWeight: 500,
          gap: '0.7rem',
          marginBottom: '1rem',
          background: 'var(--color-bg)'
        }}
        onClick={() => setShowForm(true)}
        title="Add Quote"
      >
        <FaPlus style={{ fontWeight: 'bold' }} />
      </li>
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
    </>
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

    // Realtime subscription for quotes collection
    const unsubscribe = client.subscribe(
      [`databases.main.collections.quotes.documents`],
      response => {
        // Only refresh if the quote is relevant to this group
        if (
          response.payload &&
          (
            response.payload.groupId === groupId ||
            (response.events.some(e => e.endsWith('.delete')) && quotes.some(q => q.$id === response.payload.$id))
          )
        ) {
          fetchGroupAndQuotes();
        }
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
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

  const handleDeleteQuote = async (quoteId) => {
    try {
      // Remove quote from quotes collection
      await databases.deleteDocument("main", "quotes", quoteId);
      // Remove quote from group's quoteBank
      const groupRes = await databases.getDocument("main", "groups", groupId);
      const updatedBank = Array.isArray(groupRes.quoteBank)
        ? groupRes.quoteBank.filter(id => id !== quoteId)
        : [];
      await databases.updateDocument("main", "groups", groupId, { quoteBank: updatedBank });
      await fetchGroupAndQuotes();
    } catch (err) {
      // Optionally handle error (e.g. show a message)
    }
  };

  return (
    <div className="group-page-container">
      <div className="group-page-title-row">
        <h2 className="group-page-title">{group.name}</h2>
        <div className="group-page-title-actions">
          <button
            className="group-page-icon-btn quiz"
            title="Quiz"
            onClick={() => window.location.href = `/quiz/${groupId}`}
          >
            <FaClipboardList size={28} />
          </button>
          <button
            className="group-page-icon-btn"
            title="Leaderboard"
            onClick={() => window.location.href = `/leaderboard/${groupId}`}
          >
            <FaTrophy size={22} />
          </button>
        </div>
      </div>
      <div className="group-page-title-divider" />
      <div className="group-page-quotes-section" style={{ flexGrow: 1 }}>
        <ul className="group-page-quotes-list">
          <AddQuote groupId={groupId} onQuoteAdded={fetchGroupAndQuotes} />
          {quotes.length === 0 ? (
            <li className="group-page-empty">No quotes in this group.</li>
          ) : (
            // Show newest quotes first
            [...quotes].reverse().map(q => (
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      height: '32px'
                    }}>
                      <button
                        className="group-page-btn"
                        onClick={() => handleEditClick(q)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          minWidth: 0
                        }}
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        className="group-page-btn"
                        onClick={() => handleDeleteQuote(q.$id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          minWidth: 0
                        }}
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
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
