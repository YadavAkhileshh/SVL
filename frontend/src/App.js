import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Study from './pages/Study';
import Flashcards from './pages/Flashcards';
import Test from './pages/Test';
import AITutor from './pages/AITutor';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/Profile';
import History from './pages/History';
import Learn from './pages/Learn';
import CodeRoadmap from './pages/CodeRoadmap';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/study" element={<PrivateRoute><Study /></PrivateRoute>} />
      <Route path="/flashcards" element={<PrivateRoute><Flashcards /></PrivateRoute>} />
      <Route path="/test" element={<PrivateRoute><Test /></PrivateRoute>} />
      <Route path="/tutor" element={<PrivateRoute><AITutor /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
      <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
      <Route path="/code-roadmap" element={<PrivateRoute><CodeRoadmap /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;