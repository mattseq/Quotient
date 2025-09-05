import React, { useState } from 'react';
import { databases, account } from '../appwrite';
import '../styles/CreateGroup.css';
import { Query } from 'appwrite';

function CreateGroup({ onGroupCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  // Search users using Appwrite database
  const handleUserSearch = async (query) => {
    setUserSearch(query);
    setSearching(true);
    if (!query) {
      setUserResults([]);
      setSearching(false);
      return;
    }
    try {
      const dbId = "main";
      const usersId = "users";
      // Search by name or email (adjust field names as needed)
      const res = await databases.listDocuments(dbId, usersId, [
        Query.or([
          Query.contains('username', query),
          Query.contains('email', query)
        ])
      ]);
      // Map results to { id, name, email }
      const results = res.documents
        .filter(u => !selectedUsers.some(sel => sel.id === u.$id))
        .map(u => ({ id: u.$id, name: u.name, email: u.email }));
      setUserResults(results);
    } catch (err) {
      setUserResults([]);
    }
    setSearching(false);
  };

  const handleAddUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setUserSearch('');
    setUserResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await account.get();
      let members = [user.$id, ...selectedUsers.map(u => u.id)];
      const group = await databases.createDocument("main", "groups", 'unique()', {
        name,
        members,
        quoteBank: [],
        quizzes: []
      });
      setName('');
      setSelectedUsers([]);
      setShowForm(false);
      if (onGroupCreated) onGroupCreated(group);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="create-group-container">
      <button className="create-group-btn" onClick={() => setShowForm(true)}>
        New Group
      </button>
      {showForm && (
        <div className="create-group-modal" onClick={e => {
          if (e.target.classList.contains('create-group-modal')) setShowForm(false);
        }}>
          <div className="create-group-modal-content">
            <h3 className="create-group-title">Create a New Group</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Group Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="create-group-input"
              />
              <div className="create-group-user-search-wrapper">
                <input
                  type="text"
                  placeholder="Search users to invite"
                  value={userSearch}
                  onChange={e => handleUserSearch(e.target.value)}
                  className="create-group-input"
                  autoComplete="off"
                />
                {(userResults.length > 0 && userSearch) && (
                  <ul className="create-group-user-results">
                    {userResults.map(u => (
                      <li key={u.id} onClick={() => handleAddUser(u)}>
                        {u.name} <span style={{ color: '#B0B0B0', fontSize: '0.95em', marginLeft: '0.5em' }}>{u.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedUsers.length > 0 && (
                <div className="create-group-selected-users">
                  {selectedUsers.map(u => (
                    <span key={u.id} className="create-group-user-chip">
                      {u.name}
                      <button
                        type="button"
                        className="create-group-user-chip-remove"
                        onClick={() => handleRemoveUser(u.id)}
                        aria-label={`Remove ${u.name}`}
                      >
                        &#10005;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="create-group-modal-actions">
                <button type="submit" disabled={loading} className="create-group-btn">
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
                <button type="button" className="create-group-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
            {error && <div className="create-group-error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateGroup;
