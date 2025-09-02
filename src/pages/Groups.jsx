import React, { useEffect, useState } from 'react';
import { databases, account } from '../appwrite';
import { useNavigate } from 'react-router-dom';
import CreateGroup from './CreateGroup';
import '../styles/Groups.css';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const user = await account.get();
  const dbId = "main";
  const collId = "groups";
  const res = await databases.listDocuments(dbId, collId);
  // Only show groups where user is a member
  const userGroups = res.documents.filter(g => Array.isArray(g.members) && g.members.includes(user.$id));
  setGroups(userGroups);
    } catch (err) {
      setGroups([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (loading) return <div className="groups-container">Loading...</div>;

  return (
    <div className="groups-container">
      <h2 className="groups-title">Your Groups</h2>
      <CreateGroup onGroupCreated={fetchGroups} />
      <div className="groups-list">
        {groups.length === 0 ? (
          <div className="groups-empty">No groups found.</div>
        ) : (
          <ul className="groups-list">
            {groups.map(group => (
              <li key={group.$id} className="group-item" onClick={() => navigate(`/group/${group.$id}`)}>
                {group.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Groups;
