
import React, { useState } from 'react';
import { User, UserRole, Payment, Expense, TenantStatus, ExpenseCategory } from '../types';
import { db } from '../utils/db';

interface Props {
  user: User;
  onDataChange?: () => void;
}

const Financials: React.FC<Props> = ({ user, onDataChange }) => {
  // Fixed: Added user.id to getPayments and getExpenses
  const [payments, setPayments] = useState(db.getPayments(user.id));
  const [expenses, setExpenses] = useState(db.getExpenses(user.id));
  const [view, setView] = useState<'payments' | 'expenses'>('payments');
  const [showForm, setShowForm] = useState(false);

  // Form Data Dependencies
  const properties = db.getProperties();
  const units = db.getUnits();
  // Fixed: Added user.id to getTenants
  const tenants = db.getTenants(user.id).filter(t => t.status === TenantStatus.ACTIVE);

  // Form States
  const [paymentForm, setPaymentForm] = useState({
    tenantId: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    propertyId: '',
    category: ExpenseCategory.MAINTENANCE,
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const markCorrected = (id: number) => {
    if (user.role !== UserRole.ADMIN) return;
    db.markPaymentCorrected(user.id, id);
    // Fixed: Added user.id to getPayments
    setPayments(db.getPayments(user.id));
    if (onDataChange) onDataChange();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === Number(paymentForm.tenantId));
    if (!tenant) return;

    db.addPayment(user.id, {
      tenantId: tenant.id,
      unitId: tenant.unitId,
      amount: Number(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod
    });
    
    // Fixed: Added user.id to getPayments
    setPayments(db.getPayments(user.id));
    setShowForm(false);
    setPaymentForm({
      tenantId: '',
      amount: '',
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    if (onDataChange) onDataChange();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addExpense(user.id, {
      propertyId: Number(expenseForm.propertyId),
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      expenseDate: expenseForm.expenseDate,
      description: expenseForm.description
    });

    // Fixed: Added user.id to getExpenses
    setExpenses(db.getExpenses(user.id));
    setShowForm(false);
    setExpenseForm({
      propertyId: '',
      category: ExpenseCategory.MAINTENANCE,
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    if (onDataChange) onDataChange();
  };

  const exportCSV = () => {
    const data = view === 'payments' ? payments : expenses;
    if (data.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0] || {}).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prms_export_${view}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fixed: Using correct snake_case permission keys
  const canAdd = view === 'payments' ? user.permissions.add_payments : user.permissions.add_expenses;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => { setView('payments'); setShowForm(false); }}
            className={`px-4 py-1 rounded-md text-sm transition ${view === 'payments' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
          >
            Payments
          </button>
          <button 
            onClick={() => { setView('expenses'); setShowForm(false); }}
            className={`px-4 py-1 rounded-md text-sm transition ${view === 'expenses' ? 'bg-white shadow text-orange-600 font-bold' : 'text-gray-500'}`}
          >
            Expenses
          </button>
        </div>
        
        <div className="flex gap-2">
          {canAdd && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-1 rounded text-sm text-white transition font-bold ${view === 'payments' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {showForm ? 'Cancel' : ` Add ${view === 'payments' ? 'Payment' : 'Expense'}`}
            </button>
          )}
          <button 
            onClick={exportCSV}
            className="bg-gray-800 text-white px-4 py-1 rounded text-sm hover:bg-black transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showForm && view === 'payments' && (
        <form onSubmit={handlePaymentSubmit} className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Tenant</label>
            <select 
              required
              value={paymentForm.tenantId}
              onChange={e => setPaymentForm({...paymentForm, tenantId: e.target.value})}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              <option value="">Select Tenant</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.fullName} (Unit {units.find(u => u.id === t.unitId)?.unitNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Amount ($)</label>
            <input 
              required type="number" 
              value={paymentForm.amount}
              onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
              className="w-full border p-2 rounded text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Method</label>
            <select 
              value={paymentForm.paymentMethod}
              onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Check</option>
              <option>Mobile Money</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition text-sm">
            Save Payment
          </button>
        </form>
      )}

      {showForm && view === 'expenses' && (
        <form onSubmit={handleExpenseSubmit} className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Property</label>
            <select 
              required
              value={expenseForm.propertyId}
              onChange={e => setExpenseForm({...expenseForm, propertyId: e.target.value})}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Category</label>
            <select 
              value={expenseForm.category}
              onChange={e => setExpenseForm({...expenseForm, category: e.target.value as ExpenseCategory})}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              {Object.values(ExpenseCategory).map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Amount ($)</label>
            <input 
              required type="number" 
              value={expenseForm.amount}
              onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
              className="w-full border p-2 rounded text-sm"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700 transition text-sm">
            Save Expense
          </button>
          <div className="md:col-span-4">
             <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Description</label>
             <input 
              required
              value={expenseForm.description}
              onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
              className="w-full border p-2 rounded text-sm"
              placeholder="e.g. Broken pipe in lobby"
            />
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        {view === 'payments' ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Tenant</th>
                <th className="p-2">Method</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-center">Status</th>
                {user.role === UserRole.ADMIN && <th className="p-2 text-center">Admin</th>}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">No payments recorded.</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className={`border-b transition-opacity ${p.isCorrected ? 'bg-red-50 opacity-40 italic' : ''}`}>
                  <td className="p-2">{p.paymentDate}</td>
                  <td className="p-2">
                    {tenants.find(t => t.id === p.tenantId)?.fullName || `Tenant #${p.tenantId}`}
                  </td>
                  <td className="p-2">{p.paymentMethod}</td>
                  <td className="p-2 text-right font-bold">${p.amount.toLocaleString()}</td>
                  <td className="p-2 text-center">
                    {p.isCorrected ? (
                      <span className="text-red-600 text-[10px] font-black uppercase tracking-wider">Corrected</span>
                    ) : (
                      <span className="text-green-600 text-[10px] font-black uppercase tracking-wider">Valid</span>
                    )}
                  </td>
                  {user.role === UserRole.ADMIN && (
                    <td className="p-2 text-center">
                      {!p.isCorrected && (
                        <button 
                          onClick={() => markCorrected(p.id)}
                          className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition font-bold uppercase"
                        >
                          Mark as Corrected
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-right">Reported By</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400 italic">No expenses recorded.</td></tr>
              ) : expenses.map(e => (
                <tr key={e.id} className="border-b">
                  <td className="p-2">{e.expenseDate}</td>
                  <td className="p-2 font-bold uppercase text-[10px] text-orange-700 bg-orange-50 px-1 rounded inline-block mt-2 ml-2">{e.category}</td>
                  <td className="p-2 italic text-gray-600">{e.description}</td>
                  <td className="p-2 text-right font-bold text-red-600">-${e.amount.toLocaleString()}</td>
                  <td className="p-2 text-right text-[10px] text-gray-400 uppercase">User #{e.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Financials;
