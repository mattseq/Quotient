
import React, { useEffect, useState } from 'react';
import { databases } from '../appwrite';
import CreateGroup from './CreateGroup';
import '../styles/Sidebar.css';

function Sidebar({ user, selectedGroupId, setSelectedGroupId, handleLogout }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h2 className="sidebar-title">Groups</h2>
      
      <CreateGroup onGroupCreated={fetchGroups} />

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

      <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
    </aside>
  );
}

export default Sidebar;
