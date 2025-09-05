import './App.css';
import Login from './pages/Login';
import GroupPage from './pages/GroupPage';
import Sidebar from './components/Sidebar';
import React, { useEffect, useState } from 'react';
import { account, databases } from './appwrite';

// PrivateRoute removed, logic handled in main component
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    account.get().then((user) => {
      setLoggedIn(true);
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setLoggedIn(false);
      setUser(null);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await account.get();
      setLoggedIn(true);
    } catch {
      try {
        await account.createEmailPasswordSession(email, password);
        setLoggedIn(true);
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await account.deleteSession('current');
    setLoggedIn(false);
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        handleLogout={handleLogout}
      />
      <main className="main-window">
        {selectedGroupId ? (
          <GroupPage groupId={selectedGroupId} />
        ) : (
          <div>Select a group from the sidebar.</div>
        )}
      </main>
    </div>
  );
}
export default App;
