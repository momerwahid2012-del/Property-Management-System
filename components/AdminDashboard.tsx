
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, UserPermissions } from '../types';
import { db } from '../utils/db';
import Reports from './Reports';
import Logs from './Logs';
import PropertyManager from './PropertyManager';
import Financials from './Financials';

interface Props {
  admin: User;
}

const AdminDashboard: React.FC<Props> = ({ admin }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'portfolio' | 'fiscal' | 'personnel' | 'audit'>('analytics');
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState(db.getFinancialSummary(admin.id));
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ username: '', email: '', password: '' });
  
  // Edit Profile States
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ username: '', email: '', password: '' });

  const [refreshTick, setRefreshTick] = useState(0);

  const refreshData = useCallback(() => {
    setSummary(db.getFinancialSummary(admin.id));
    setUsers(db.getUsers()); // Get all users so admin can edit themselves too
    setRefreshTick(prev => prev + 1);
  }, [admin.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData, activeTab]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    db.addEmployee(admin.id, newEmployee);
    setNewEmployee({ username: '', email: '', password: '' });
    setShowAddEmployeeForm(false);
    refreshData();
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({ 
      username: user.username, 
      email: user.email, 
      password: user.password || '' 
    });
  };

  const submitUserUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId !== null) {
      db.updateUser(admin.id, editingUserId, editFormData);
      setEditingUserId(null);
      refreshData();
    }
  };

  const updatePermissions = (userId: number, key: keyof UserPermissions, value: any) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newPerms = { ...user.permissions, [key]: value };
      db.updateUserPermissions(admin.id, userId, newPerms);
      refreshData();
    }
  };

  const clearAllLogs = () => {
    if (window.confirm("CONFIRMATION: Purge global audit repository? This action is irreversible.")) {
      db.clearLogs(admin.id);
      refreshData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Professional Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'analytics', label: 'Performance Analytics' },
          { id: 'portfolio', label: 'Portfolio Assets' },
          { id: 'fiscal', label: 'Fiscal Ledger' },
          { id: 'personnel', label: 'Personnel Registry' },
          { id: 'audit', label: 'Audit Intelligence' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all capitalize whitespace-nowrap tracking-[0.15em] ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-l-[10px] border-l-emerald-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Aggregate Inflow</h3>
              <p className="text-4xl font-black text-gray-800">${summary.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-l-[10px] border-l-rose-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Operational Outflow</h3>
              <p className="text-4xl font-black text-gray-800">${summary.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-l-[10px] border-l-indigo-500 sm:col-span-2 lg:col-span-1">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Net Fiscal Margin</h3>
              <p className="text-4xl font-black text-gray-800">${summary.netProfit.toLocaleString()}</p>
            </div>
          </div>
          <Reports userId={admin.id} key={`reports-${refreshTick}`} />
        </div>
      )}

      {activeTab === 'portfolio' && <PropertyManager user={admin} key={`mgmt-${refreshTick}`} />}
      {activeTab === 'fiscal' && <Financials user={admin} onDataChange={refreshData} key={`fin-${refreshTick}`} />}

      {activeTab === 'personnel' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100">
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Identity & Access Control</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Workforce Authorization Matrix</p>
            </div>
            <button 
              onClick={() => setShowAddEmployeeForm(true)} 
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition active:scale-95"
            >
              + Provision New Account
            </button>
          </div>
          
          {showAddEmployeeForm && (
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border-2 border-blue-50 animate-in slide-in-from-top-4 duration-500">
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Login Identifier</label>
                  <input required value={newEmployee.username} onChange={e => setNewEmployee({...newEmployee, username: e.target.value})} className="w-full bg-gray-50 border-0 p-3.5 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Corporate Email</label>
                  <input required type="email" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} className="w-full bg-gray-50 border-0 p-3.5 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Master Key</label>
                  <input required type="password" value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} className="w-full bg-gray-50 border-0 p-3.5 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex-1 hover:bg-blue-700 transition">Commit Profile</button>
                  <button type="button" onClick={() => setShowAddEmployeeForm(false)} className="bg-gray-100 text-gray-500 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {users.map(u => (
              <div key={u.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                <div className={`absolute top-0 right-0 px-6 py-2 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-2xl ${u.role === UserRole.ADMIN ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                  {u.role === UserRole.ADMIN ? 'Primary Administrator' : `Personnel Assignment #${u.id}`}
                </div>
                
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-1">{u.username}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{u.email}</p>
                  </div>
                  <button 
                    onClick={() => handleEditUser(u)}
                    className="bg-gray-50 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-50 hover:text-blue-600 transition tracking-widest"
                  >
                    Edit Credentials
                  </button>
                </div>

                {editingUserId === u.id && (
                  <div className="mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in zoom-in-95 duration-300">
                    <form onSubmit={submitUserUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">New Identifier</label>
                        <input value={editFormData.username} onChange={e => setEditFormData({...editFormData, username: e.target.value})} className="w-full p-2.5 rounded-xl bg-white text-xs border border-gray-200 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">New Endpoint</label>
                        <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full p-2.5 rounded-xl bg-white text-xs border border-gray-200 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">New Access Key</label>
                        <input type="password" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} className="w-full p-2.5 rounded-xl bg-white text-xs border border-gray-200 outline-none" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-blue-600 text-white p-2.5 rounded-xl text-[10px] font-black uppercase">Update</button>
                        <button type="button" onClick={() => setEditingUserId(null)} className="flex-1 bg-gray-200 text-gray-600 p-2.5 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
                
                {u.role !== UserRole.ADMIN && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 opacity-80">
                    {[
                      { label: 'Fiscal Creation', keys: ['add_properties', 'add_units', 'add_tenants', 'add_payments', 'add_expenses'] },
                      { label: 'Data Management', keys: ['edit_property_details', 'edit_unit_details', 'edit_tenant_details', 'edit_payments', 'edit_expenses', 'correct_records'] },
                      { label: 'Inquiry Scope', keys: ['view_properties', 'view_units', 'view_tenants', 'view_payments', 'view_expenses', 'view_financial_totals'] },
                      { label: 'Operational Safety', keys: ['require_admin_approval_for_payments', 'require_admin_approval_for_expenses', 'require_mandatory_notes_on_edits'] }
                    ].map(section => (
                      <div key={section.label}>
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 border-b border-blue-50 pb-2">{section.label}</h4>
                        <div className="space-y-3">
                          {section.keys.map(k => (
                            <label key={k} className="flex items-center gap-3 group/item cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={u.permissions[k as keyof UserPermissions] as boolean} 
                                onChange={e => updatePermissions(u.id, k as any, e.target.checked)} 
                                className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                              />
                              <span className="text-[10px] font-black text-gray-500 group-hover/item:text-blue-600 transition-colors uppercase tracking-tight">{k.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Global Audit Repository</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Authenticated System Provenance</p>
            </div>
            <button 
              onClick={clearAllLogs} 
              className="w-full sm:w-auto bg-rose-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 shadow-2xl shadow-rose-200 transition active:scale-95 border-b-4 border-rose-800"
            >
              Purge Audit History
            </button>
          </div>
          <Logs userId={admin.id} key={`logs-${refreshTick}`} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
