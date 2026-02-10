
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from './types';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import { db } from './utils/db';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dbTick, setDbTick] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('prms_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsInitialized(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (db.undo()) setDbTick(t => t + 1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (db.redo()) setDbTick(t => t + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('prms_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prms_user');
  };

  if (!isInitialized) return null;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout user={currentUser} onLogout={handleLogout}>
      {currentUser.role === UserRole.ADMIN ? (
        <AdminDashboard admin={currentUser} key={dbTick} />
      ) : (
        <EmployeeDashboard employee={currentUser} key={dbTick} />
      )}
    </DashboardLayout>
  );
};

export default App;
