
import React, { useState } from 'react';
import { User, Property, Unit, TenantStatus } from '../types';
import { db } from '../utils/db';

interface Props { user: User; }

const PropertyManager: React.FC<Props> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'properties' | 'units' | 'tenants'>('properties');
  const [properties, setProperties] = useState(db.getProperties());
  const [units, setUnits] = useState(db.getUnits());
  const [tenants, setTenants] = useState(db.getTenants(user.id));

  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showTenantForm, setShowTenantForm] = useState(false);

  const [propertyForm, setPropertyForm] = useState({ name: '', location: '', type: 'Residential' });
  const [unitForm, setUnitForm] = useState({ propertyId: '', unitNumber: '', rentAmount: '', maxTenants: '' });
  const [tenantForm, setTenantForm] = useState({ fullName: '', phone: '', moveInDate: '', unitId: '' });

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.permissions.add_properties) return;
    db.addProperty(user.id, propertyForm);
    setProperties(db.getProperties());
    setShowPropertyForm(false);
    setPropertyForm({ name: '', location: '', type: 'Residential' });
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.permissions.add_units) return;
    db.addUnit(user.id, {
      ...unitForm,
      propertyId: Number(unitForm.propertyId),
      rentAmount: Number(unitForm.rentAmount),
      maxTenants: unitForm.maxTenants ? Number(unitForm.maxTenants) : null
    });
    setUnits(db.getUnits());
    setShowUnitForm(false);
    setUnitForm({ propertyId: '', unitNumber: '', rentAmount: '', maxTenants: '' });
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.permissions.add_tenants) return;
    db.addTenant(user.id, {
      fullName: tenantForm.fullName,
      phone: tenantForm.phone,
      moveInDate: tenantForm.moveInDate,
      unitId: Number(tenantForm.unitId)
    });
    setTenants(db.getTenants(user.id));
    setShowTenantForm(false);
    setTenantForm({ fullName: '', phone: '', moveInDate: '', unitId: '' });
  };

  const updateTenantStatus = (id: number, status: TenantStatus) => {
    db.updateTenantStatus(user.id, id, status);
    setTenants(db.getTenants(user.id));
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-6 md:p-10 min-h-[500px] border border-gray-100">
      <div className="flex gap-2 mb-10 bg-gray-50 p-1.5 rounded-2xl w-fit">
        {['properties', 'units', 'tenants'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab as any)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeSubTab === tab ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'properties' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Corporate Asset Registry</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">High-Value Portfolio Management</p>
            </div>
            {user.permissions.add_properties && (
              <button 
                onClick={() => setShowPropertyForm(true)} 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition hover:bg-blue-700 active:scale-95 border-b-4 border-blue-800"
              >
                + Register New Asset
              </button>
            )}
          </div>
          {showPropertyForm && (
            <form onSubmit={handleAddProperty} className="bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 shadow-inner animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Legal Entity Name</label>
                  <input required value={propertyForm.name} onChange={e => setPropertyForm({...propertyForm, name: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Geospatial Location</label>
                  <input required value={propertyForm.location} onChange={e => setPropertyForm({...propertyForm, location: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Asset Classification</label>
                  <select value={propertyForm.type} onChange={e => setPropertyForm({...propertyForm, type: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none w-full shadow-sm">
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Mixed Use</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200">Commit Asset</button>
                <button type="button" onClick={() => setShowPropertyForm(false)} className="bg-white text-gray-400 px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-gray-100 shadow-sm">Cancel</button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto rounded-[1.5rem] border border-gray-50">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr><th className="p-5">Asset Identifier</th><th className="p-5">Location Scope</th><th className="p-5 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.length === 0 ? <tr><td colSpan={3} className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] italic">No Assets Validated</td></tr> : properties.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-5 font-black text-gray-800 text-base">{p.name}</td>
                    <td className="p-5 font-bold text-gray-500">{p.location}</td>
                    <td className="p-5 text-center">
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 shadow-sm">{p.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'units' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Unit Inventory Ledger</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Yield Distribution</p>
            </div>
            {user.permissions.add_units && (
              <button 
                onClick={() => setShowUnitForm(true)} 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition hover:bg-blue-700 border-b-4 border-blue-800"
              >
                + Initialize New Unit
              </button>
            )}
          </div>
          {showUnitForm && (
            <form onSubmit={handleAddUnit} className="bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 shadow-inner animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Parent Entity</label>
                  <select required value={unitForm.propertyId} onChange={e => setUnitForm({...unitForm, propertyId: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-100 outline-none w-full shadow-sm">
                    <option value="">-- Selection --</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Unique Identifier</label>
                  <input required placeholder="E.g. Penthouse A" value={unitForm.unitNumber} onChange={e => setUnitForm({...unitForm, unitNumber: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-100 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Contractual Yield ($)</label>
                  <input required type="number" value={unitForm.rentAmount} onChange={e => setUnitForm({...unitForm, rentAmount: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-100 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">Occupancy Cap</label>
                  <input type="number" value={unitForm.maxTenants} onChange={e => setUnitForm({...unitForm, maxTenants: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-blue-100 outline-none w-full shadow-sm" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest">Validate Unit</button>
                <button type="button" onClick={() => setShowUnitForm(false)} className="bg-white text-gray-400 px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-gray-100 shadow-sm">Cancel</button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto rounded-[1.5rem] border border-gray-50">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr><th className="p-5">Unit Designation</th><th className="p-5">Associated Asset</th><th className="p-5 text-right">Yield Performance</th><th className="p-5 text-center">Threshold</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {units.length === 0 ? <tr><td colSpan={4} className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] italic">Inventory Records Depleted</td></tr> : units.map(u => (
                  <tr key={u.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-5 font-black text-gray-800">{u.unitNumber}</td>
                    <td className="p-5 font-bold text-gray-400">{properties.find(p => p.id === u.propertyId)?.name}</td>
                    <td className="p-5 text-right font-black text-emerald-600 text-base">${u.rentAmount.toLocaleString()}</td>
                    <td className="p-5 text-center"><span className="text-[9px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest shadow-inner">{u.maxTenants || 'UNLIMITED'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'tenants' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Resident Registry</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupancy Logistics & Verification</p>
            </div>
            {user.permissions.add_tenants && (
              <button 
                onClick={() => setShowTenantForm(true)} 
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition hover:bg-emerald-700 border-b-4 border-emerald-800"
              >
                + Finalize New Onboarding
              </button>
            )}
          </div>
          {showTenantForm && (
            <form onSubmit={handleAddTenant} className="bg-emerald-50/50 p-10 rounded-[2.5rem] border border-emerald-100 shadow-inner animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-2">Legal Full Name</label>
                  <input required value={tenantForm.fullName} onChange={e => setTenantForm({...tenantForm, fullName: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-emerald-100 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-2">Authenticated Contact</label>
                  <input required placeholder="+1 (555) 000-0000" value={tenantForm.phone} onChange={e => setTenantForm({...tenantForm, phone: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-emerald-100 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-2">Commencement Date</label>
                  <input required type="date" value={tenantForm.moveInDate} onChange={e => setTenantForm({...tenantForm, moveInDate: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-emerald-100 outline-none w-full shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-2">Allocated Inventory Unit</label>
                  <select required value={tenantForm.unitId} onChange={e => setTenantForm({...tenantForm, unitId: e.target.value})} className="bg-white border-0 p-4 rounded-2xl text-sm focus:ring-2 ring-emerald-100 outline-none w-full shadow-sm">
                    <option value="">-- Finalize Unit --</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.unitNumber} ({properties.find(p => p.id === u.propertyId)?.name})</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-emerald-600 text-white px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest">Finalize Residency</button>
                <button type="button" onClick={() => setShowTenantForm(false)} className="bg-white text-gray-400 px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-gray-100">Cancel</button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto rounded-[1.5rem] border border-gray-50 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-5">System Token</th>
                  <th className="p-5">Subject Name</th>
                  <th className="p-5">Inventory Link</th>
                  <th className="p-5">Engagement</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.length === 0 ? <tr><td colSpan={5} className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] italic">Registry Database Vacant</td></tr> : tenants.map(t => (
                  <tr key={t.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="p-5"><span className="p-2.5 font-black text-emerald-600 bg-emerald-50 text-[10px] rounded-xl border border-emerald-100 uppercase tracking-widest shadow-sm">{t.autoId}</span></td>
                    <td className="p-5 font-black text-gray-800 text-base">{t.fullName}</td>
                    <td className="p-5 font-bold text-gray-400">{units.find(u => u.id === t.unitId)?.unitNumber}</td>
                    <td className="p-5">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${t.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {t.status === 'active' && user.permissions.change_tenant_status && (
                        <button onClick={() => updateTenantStatus(t.id, 'left' as any)} className="text-[9px] font-black text-rose-600 border-2 border-rose-100 px-4 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition uppercase tracking-widest shadow-sm">Terminate Engagement</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;
