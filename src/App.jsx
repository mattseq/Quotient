import './App.css';
import Login from './pages/Login';
import Groups from './pages/Groups';
import GroupPage from './pages/GroupPage';
import QuizPage from './pages/QuizPage';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { account } from './appwrite';

function PrivateRoute({ children, loggedIn }) {
  const location = useLocation();
  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    account.get().then(() => {
      setLoggedIn(true);
      setLoading(false);
    }).catch(() => {
      setLoggedIn(false);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (email, password) => {
    try {
      // Check if already logged in
      await account.get();
      setLoggedIn(true);
      navigate('/menu');
    } catch {
      // Not logged in, so try to log in
      try {
        await account.createEmailPasswordSession(email, password);
        setLoggedIn(true);
        navigate('/menu');
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await account.deleteSession('current');
    setLoggedIn(false);
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="main-content">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/menu" element={
          <PrivateRoute loggedIn={loggedIn}>
            <Groups />
          </PrivateRoute>
        } />
        <Route path="/group/:groupId" element={
          <PrivateRoute loggedIn={loggedIn}>
            <GroupPage />
          </PrivateRoute>
        } />
        <Route path="/quiz/:groupId" element={
          <PrivateRoute loggedIn={loggedIn}>
            <QuizPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to={loggedIn ? "/menu" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
export default App;
