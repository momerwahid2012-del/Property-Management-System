
import React, { useState } from 'react';
import { db } from '../utils/db';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.getUsers().find(u => u.username === identifier || u.email === identifier);
    
    // In a real app, use secure hashing.
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Invalid username/email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">PRMS Login</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Property Management System</p>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username or Email</label>
            <input 
              required
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-bold"
          >
            Login to System
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
