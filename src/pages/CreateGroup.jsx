import React, { useState } from 'react';
import { databases, account } from '../appwrite';
import '../styles/CreateGroup.css';

function CreateGroup({ onGroupCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await account.get();
      let members = [user.$id];
      // Invite user by username/email (simple demo, you may want to look up userId by username/email)
      if (invite.trim()) {
        // You would need to implement a lookup here to get the userId from username/email
        // For now, just add the invite string as a placeholder
        members.push(invite.trim());
      }
      const group = await databases.createDocument("main", "groups", 'unique()', {
        name,
        members,
        quoteBank: [],
        quizzes: []
      });
      setName('');
      setInvite('');
      setShowForm(false);
      if (onGroupCreated) onGroupCreated(group);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="create-group-container">
      {!showForm ? (
        <button className="create-group-btn" onClick={() => setShowForm(true)}>
          New Group
        </button>
      ) : (
        <div className="create-group-form">
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
            <input
              type="text"
              placeholder="Invite user (username or email)"
              value={invite}
              onChange={e => setInvite(e.target.value)}
              className="create-group-input"
            />
            <button type="submit" disabled={loading} className="create-group-btn">
              {loading ? 'Creating...' : 'Create Group'}
            </button>
            <button type="button" className="create-group-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
          {error && <div className="create-group-error">{error}</div>}
        </div>
      )}
    </div>
  );
}

export default CreateGroup;
