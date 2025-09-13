import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { databases } from '../appwrite';
import CreateGroup from './CreateGroup';
import '../styles/Sidebar.css';
import { FaPlus } from 'react-icons/fa';
import Logo from '../assets/quotient_icon.png';

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
        <img src={Logo} alt="Quotient Logo" className="sidebar-logo" />
        Quotient
      </div>
      <div className="sidebar-scroll-area">
        <AnimatePresence>
          {loading ? (
            <motion.div className="sidebar-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Loading...
            </motion.div>
          ) : groups.length === 0 ? (
            <motion.div className="sidebar-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              No groups found.
            </motion.div>
          ) : (
            <motion.ul className="sidebar-group-list" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
              {groups.map(group => (
                <motion.li
                  key={group.$id}
                  className={`sidebar-group-item${selectedGroupId === group.$id ? ' selected' : ''}`}
                  onClick={() => setSelectedGroupId(group.$id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  {group.name}
                </motion.li>
              ))}
              <li>
                <button
                  className="sidebar-group-item sidebar-new-group"
                  onClick={() => setShowCreateGroup(true)}
                  type="button"
                  style={{ justifyContent: 'center', padding: '0.6rem 0.8rem', fontSize: '1rem', lineHeight: '1', width: '100%' }}
                >
                  <FaPlus></FaPlus>
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}
          >
            <CreateGroup
              onGroupCreated={() => {
                fetchGroups();
                setShowCreateGroup(false);
              }}
              onClose={() => setShowCreateGroup(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
    </aside>
  );
}

export default Sidebar;
