
import React from 'react';
import { User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="bg-blue-800 text-white shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold tracking-tight">PRMS Portal</h1>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm">
              <span className="opacity-75">Logged in as:</span>{' '}
              <span className="font-semibold">{user.username}</span> ({user.role})
            </div>
            <button 
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm transition font-bold shadow-md active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
