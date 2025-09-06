import React, { useEffect, useState } from 'react';
import { databases } from '../appwrite';
import CreateGroup from './CreateGroup';
import '../styles/Sidebar.css';
import { FaPlus } from 'react-icons/fa';

function Sidebar({ user, selectedGroupId, setSelectedGroupId, handleLogout }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dbId = "main";
      const collId = "groups";
      const res = await databases.listDocuments(dbId, collId);
      const userGroups = res.documents.filter(g => Array.isArray(g.members) && g.members.includes(user.$id));
      setGroups(userGroups);
      // Select first group by default
      if (userGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(userGroups[0].$id);
      }
    } catch {
      setGroups([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, [user]);

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <img src="/src/assets/quotient_icon.png" alt="Quotient Logo" className="sidebar-logo" />
        Quotient
      </div>

      {loading ? (
        <div className="sidebar-empty">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="sidebar-empty">No groups found.</div>
      ) : (
        <ul className="sidebar-group-list">
          {groups.map(group => (
            <li
              key={group.$id}
              className={`sidebar-group-item${selectedGroupId === group.$id ? ' selected' : ''}`}
              onClick={() => setSelectedGroupId(group.$id)}
            >
              {group.name}
            </li>
          ))}
        </ul>
      )}

      <button
        className="sidebar-group-item sidebar-new-group"
        onClick={() => setShowCreateGroup(true)}
        type="button"
        style={{ justifyContent: 'center', padding: '0.6rem 0.8rem', fontSize: '1rem', lineHeight: '1' }}
      >
        <FaPlus></FaPlus>
      </button>

      {showCreateGroup && (
        <CreateGroup
          onGroupCreated={() => {
            fetchGroups();
            setShowCreateGroup(false);
          }}
          onClose={() => setShowCreateGroup(false)}
        />
      )}

      <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
    </aside>
  );
}

export default Sidebar;
