
import React from 'react';
import { db } from '../utils/db';

interface Props {
  userId: number;
}

const Logs: React.FC<Props> = ({ userId }) => {
  const logs = db.getLogs(userId);
  const users = db.getUsers();

  return (
    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6 bg-gray-50/50 border-b flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-800 tracking-tight">Authenticated Audit Trail</h3>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">{logs.length} Operations Processed</span>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-10">
            <tr>
              <th className="p-5">Temporal Index</th>
              <th className="p-5">Subject Entity</th>
              <th className="p-5 text-center">Protocol Action</th>
              <th className="p-5">Repository Target</th>
              <th className="p-5 text-right">System Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-blue-50/10 transition-colors">
                <td className="p-5 text-gray-500 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-5 font-black text-gray-800 uppercase tracking-tighter">{users.find(u => u.id === log.userId)?.username || 'Unknown'}</td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                    log.action.includes('CREATE') || log.action.includes('REGISTER') || log.action.includes('PROVISION') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    log.action.includes('DELETE') || log.action.includes('PURGE') || log.action.includes('TERMINATE') ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{log.tableName}</td>
                <td className="p-5 text-right font-mono text-gray-300">#000{log.recordId}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="p-24 text-center text-gray-300 font-black uppercase tracking-[0.4em] italic">Audit Trail Repository Purged</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
