
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { db } from '../utils/db';

interface Props {
  userId: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 border border-gray-100 shadow-xl rounded-2xl text-xs">
        <p className="font-black text-gray-800 mb-2 uppercase tracking-widest text-[10px]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-6 mb-1">
            <span className="text-gray-500 font-bold capitalize">{entry.name}:</span>
            <span className="font-black" style={{ color: entry.color }}>
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Reports: React.FC<Props> = ({ userId }) => {
  const payments = db.getPayments(userId).filter(p => !p.isCorrected);
  const expenses = db.getExpenses(userId);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((m, idx) => {
    const monthIncome = payments
      .filter(p => new Date(p.paymentDate).getMonth() === idx)
      .reduce((sum, p) => sum + p.amount, 0);
    const monthExpense = expenses
      .filter(e => new Date(e.expenseDate).getMonth() === idx)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      name: m,
      income: monthIncome,
      expense: monthExpense,
      profit: monthIncome - monthExpense
    };
  }).filter((d, idx) => {
    const currentMonth = new Date().getMonth();
    return idx <= currentMonth && (idx > currentMonth - 6);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Income vs Expenses Chart */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Cash Inflow vs Outflow</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Last 6 Months</p>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Income</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-500"></div> Expenses</div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} name="income" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} name="expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Trend Chart */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Profitability Path</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Net Performance</p>
          </div>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Growth</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#6366f1" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
                name="profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
