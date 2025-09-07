
import './App.css';
import Login from './pages/Login';
import GroupPage from './pages/GroupPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Sidebar from './components/Sidebar';
import QuizPage from './pages/QuizPage';
import React, { useEffect, useState } from 'react';
import { account } from './appwrite';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

function ProtectedRoute({ loggedIn, children }) {
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    account.get().then((user) => {
      setLoggedIn(true);
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setLoggedIn(false);
      setUser(null);
      setLoading(false);
      navigate('/login');
    });
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const userData = await account.get();
      setLoggedIn(true);
      setUser(userData);
      navigate('/');
    } catch {
      try {
        await account.createEmailPasswordSession(email, password);
        const userData = await account.get();
        setLoggedIn(true);
        setUser(userData);
        navigate('/');
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await account.deleteSession('current');
    setLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} />}
      />
      <Route
        path="/quiz/:groupId"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:groupId"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
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
                  <div style={{ padding: '1rem' }}>Select a group from the sidebar.</div>
                )}
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} replace />} />
    </Routes>
  );
}
export default App;
