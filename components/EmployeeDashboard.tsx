
import React, { useState } from 'react';
import { User, TenantStatus, ExpenseCategory } from '../types';
import { db } from '../utils/db';

interface Props {
  employee: User;
}

const EmployeeDashboard: React.FC<Props> = ({ employee }) => {
  const [message, setMessage] = useState('');
  const properties = db.getProperties();
  const units = db.getUnits();
  // Fixed: Added employee.id to getTenants
  const tenants = db.getTenants(employee.id).filter(t => t.status === TenantStatus.ACTIVE);

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

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fixed: Using correct snake_case permission key
    if (!employee.permissions.add_payments) return;
    
    const tenant = tenants.find(t => t.id === Number(paymentForm.tenantId));
    if (!tenant) return;

    db.addPayment(employee.id, {
      tenantId: tenant.id,
      unitId: tenant.unitId,
      amount: Number(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod
    });
    
    setPaymentForm({
      tenantId: '',
      amount: '',
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setMessage('Payment recorded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fixed: Using correct snake_case permission key
    if (!employee.permissions.add_expenses) return;

    db.addExpense(employee.id, {
      propertyId: Number(expenseForm.propertyId),
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      expenseDate: expenseForm.expenseDate,
      description: expenseForm.description
    });

    setExpenseForm({
      propertyId: '',
      category: ExpenseCategory.MAINTENANCE,
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setMessage('Expense recorded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Form */}
        <section className={`bg-white p-6 rounded-lg shadow ${!employee.permissions.add_payments && 'opacity-50 pointer-events-none'}`}>
          <h2 className="text-xl font-bold mb-4 text-blue-800">New Payment Submission</h2>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Tenant</label>
              <select 
                required
                value={paymentForm.tenantId}
                onChange={e => setPaymentForm({...paymentForm, tenantId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                <option value="">-- Select Active Tenant --</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName} (Unit {units.find(u => u.id === t.unitId)?.unitNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
              <input 
                type="number" 
                required
                value={paymentForm.amount}
                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Method</label>
                <select 
                  value={paymentForm.paymentMethod}
                  onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Check</option>
                  <option>Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input 
                  type="date" 
                  required
                  value={paymentForm.paymentDate}
                  onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Submit Payment Record
            </button>
          </form>
        </section>

        {/* Expense Form */}
        <section className={`bg-white p-6 rounded-lg shadow ${!employee.permissions.add_expenses && 'opacity-50 pointer-events-none'}`}>
          <h2 className="text-xl font-bold mb-4 text-orange-800">New Expense Submission</h2>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <select 
                required
                value={expenseForm.propertyId}
                onChange={e => setExpenseForm({...expenseForm, propertyId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                <option value="">-- Select Property --</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select 
                value={expenseForm.category}
                onChange={e => setExpenseForm({...expenseForm, category: e.target.value as ExpenseCategory})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                {Object.values(ExpenseCategory).map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
              <input 
                type="number" 
                required
                value={expenseForm.amount}
                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                required
                value={expenseForm.description}
                onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                rows={3}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition"
            >
              Submit Expense Record
            </button>
          </form>
        </section>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Your Recent Submissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Fixed: Added employee.id to getPayments */}
              {db.getPayments(employee.id).filter(p => p.createdBy === employee.id).slice(0, 5).map(p => (
                <tr key={`p-${p.id}`}>
                  <td className="px-4 py-2">{p.paymentDate}</td>
                  <td className="px-4 py-2"><span className="text-blue-600 font-bold">Payment</span></td>
                  <td className="px-4 py-2">Tenant #{p.tenantId}</td>
                  <td className="px-4 py-2 text-right text-green-600">+${p.amount.toLocaleString()}</td>
                </tr>
              ))}
              {/* Fixed: Added employee.id to getExpenses */}
              {db.getExpenses(employee.id).filter(e => e.createdBy === employee.id).slice(0, 5).map(e => (
                <tr key={`e-${e.id}`}>
                  <td className="px-4 py-2">{e.expenseDate}</td>
                  <td className="px-4 py-2"><span className="text-orange-600 font-bold">Expense</span></td>
                  <td className="px-4 py-2">{e.category}</td>
                  <td className="px-4 py-2 text-right text-red-600">-${e.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
