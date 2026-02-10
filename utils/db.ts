
import { 
  Property, Unit, Tenant, Payment, Expense, User, ActivityLog, 
  UserRole, TenantStatus, ExpenseCategory, UserPermissions, TransactionStatus 
} from '../types';

const defaultPermissions: UserPermissions = {
  add_properties: false, add_units: true, add_tenants: true, add_tenant_notes: true, add_payments: true, add_expenses: true, add_expense_categories: false, add_employee_accounts: false,
  edit_property_details: false, edit_unit_details: false, edit_tenant_details: true, change_tenant_status: true, edit_payments: false, edit_expenses: false, correct_records: false,
  delete_units: false, delete_payments: false, delete_expenses: false, archive_tenants: true, force_delete_property: false,
  view_properties: true, view_units: true, view_tenants: true, view_tenant_contact_details: true, view_payments: true, view_expenses: true, view_financial_totals: true, view_profit_and_loss: false, view_expected_next_month_report: false,
  view_reports: true, view_charts: true, view_monthly_reports: true, view_yearly_reports: false, export_reports: false,
  view_employee_list: false, edit_employee_permissions: false, activate_deactivate_employees: false, reset_employee_passwords: false,
  view_activity_logs: false, view_own_logs_only: true, view_all_employee_logs: false,
  allow_backdated_entries: false, backdate_limit_days: 0, lock_previous_month_records: true, edit_only_same_day_records: true,
  restrict_to_assigned_properties: false, restrict_to_assigned_units: false, restrict_to_assigned_tenants: false, view_only_own_entries: false,
  require_admin_approval_for_payments: true, require_admin_approval_for_expenses: true, require_mandatory_notes_on_edits: true, require_reason_for_corrections: true
};

const generateId = (items: { id: number }[]) => 
  items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

class MockDB {
  private properties: Property[] = [];
  private units: Unit[] = [];
  private tenants: Tenant[] = [];
  private payments: Payment[] = [];
  private expenses: Expense[] = [];
  private users: User[] = [];
  private logs: ActivityLog[] = [];
  
  private history: string[] = [];
  private redoStack: string[] = [];

  constructor() {
    this.load();
    if (this.users.length === 0) {
      this.users.push({ 
        id: 1, username: 'admin', email: 'admin@prms.com', password: 'admin', role: UserRole.ADMIN, isActive: true, assignedPropertyIds: [],
        permissions: { ...defaultPermissions, add_properties: true, add_units: true, view_activity_logs: true, view_all_employee_logs: true, edit_employee_permissions: true }
      });
      this.save();
    }
  }

  private load() {
    const data = localStorage.getItem('prms_data');
    if (data) {
      const parsed = JSON.parse(data);
      this.properties = parsed.properties || [];
      this.units = parsed.units || [];
      this.tenants = parsed.tenants || [];
      this.payments = parsed.payments || [];
      this.expenses = parsed.expenses || [];
      this.users = parsed.users || [];
      this.logs = parsed.logs || [];
    }
  }

  private save(pushToHistory: boolean = true) {
    const state = JSON.stringify({
      properties: this.properties, units: this.units, tenants: this.tenants,
      payments: this.payments, expenses: this.expenses, users: this.users, logs: this.logs
    });
    localStorage.setItem('prms_data', state);
    if (pushToHistory) {
      this.history.push(state);
      if (this.history.length > 50) this.history.shift();
      this.redoStack = [];
    }
  }

  undo() {
    if (this.history.length > 1) {
      const currentState = this.history.pop()!;
      this.redoStack.push(currentState);
      const prevState = this.history[this.history.length - 1];
      localStorage.setItem('prms_data', prevState);
      this.load();
      return true;
    }
    return false;
  }

  redo() {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop()!;
      this.history.push(nextState);
      localStorage.setItem('prms_data', nextState);
      this.load();
      return true;
    }
    return false;
  }

  private checkPermission(userId: number, key: keyof UserPermissions): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    return !!user.permissions[key];
  }

  private logAction(userId: number, action: string, tableName: string, recordId: number) {
    const log: ActivityLog = { id: generateId(this.logs), userId, action, tableName, recordId, timestamp: new Date().toISOString() };
    this.logs.unshift(log);
    this.save();
  }

  clearLogs(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (user?.role !== UserRole.ADMIN) {
      console.warn("Unauthorized log wipe attempt");
      return;
    }
    this.logs = [];
    this.save(true);
  }

  // Properties
  addProperty(userId: number, data: Omit<Property, 'id'>) {
    if (!this.checkPermission(userId, 'add_properties')) throw new Error("Unauthorized");
    const property: Property = { id: generateId(this.properties), ...data };
    this.properties.push(property);
    this.logAction(userId, 'CREATE_ASSET', 'properties', property.id);
    return property;
  }

  // Units
  addUnit(userId: number, data: Omit<Unit, 'id'>) {
    if (!this.checkPermission(userId, 'add_units')) throw new Error("Unauthorized");
    const unit: Unit = { id: generateId(this.units), ...data };
    this.units.push(unit);
    this.logAction(userId, 'CREATE_UNIT', 'units', unit.id);
    return unit;
  }

  // Auth & Users
  getUsers() { return this.users; }
  
  addEmployee(adminId: number, data: any) {
    if (this.users.find(u => u.id === adminId)?.role !== UserRole.ADMIN) return;
    const user: User = {
      id: generateId(this.users),
      username: data.username,
      email: data.email,
      password: data.password,
      role: UserRole.EMPLOYEE,
      isActive: true,
      assignedPropertyIds: [],
      permissions: { ...defaultPermissions }
    };
    this.users.push(user);
    this.logAction(adminId, 'PROVISION_ACCOUNT', 'users', user.id);
    return user;
  }

  updateUser(adminId: number, userId: number, data: Partial<User>) {
    if (this.users.find(u => u.id === adminId)?.role !== UserRole.ADMIN && adminId !== userId) return;
    const user = this.users.find(u => u.id === userId);
    if (user) {
      if (data.username) user.username = data.username;
      if (data.email) user.email = data.email;
      if (data.password) user.password = data.password;
      if (data.isActive !== undefined) user.isActive = data.isActive;
      this.logAction(adminId, 'UPDATE_USER_PROFILE', 'users', userId);
      this.save();
    }
  }

  updateUserPermissions(adminId: number, userId: number, permissions: UserPermissions) {
    if (!this.checkPermission(adminId, 'edit_employee_permissions')) throw new Error("Unauthorized");
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.permissions = permissions;
      this.logAction(adminId, 'MODIFY_ACCESS_CONTROL', 'users', userId);
    }
  }

  // Tenants
  getTenants(userId: number) {
    if (!this.checkPermission(userId, 'view_tenants')) return [];
    return this.tenants;
  }
  
  addTenant(userId: number, data: Omit<Tenant, 'id' | 'autoId' | 'status'>) {
    if (!this.checkPermission(userId, 'add_tenants')) throw new Error("Unauthorized");
    const id = generateId(this.tenants);
    const tenant: Tenant = { 
      id, 
      ...data, 
      autoId: `TNT-${String(id).padStart(4, '0')}`,
      status: TenantStatus.ACTIVE 
    };
    this.tenants.push(tenant);
    this.logAction(userId, 'REGISTER_TENANT', 'tenants', tenant.id);
    return tenant;
  }

  updateTenantStatus(userId: number, id: number, status: TenantStatus) {
    if (!this.checkPermission(userId, 'change_tenant_status')) throw new Error("Unauthorized");
    const t = this.tenants.find(t => t.id === id);
    if (t) {
      t.status = status;
      this.logAction(userId, 'CHANGE_TENANT_STATUS', 'tenants', id);
    }
  }

  // Payments
  getPayments(userId: number) {
    if (!this.checkPermission(userId, 'view_payments')) return [];
    const user = this.users.find(u => u.id === userId);
    if (user?.role !== UserRole.ADMIN && user?.permissions.view_only_own_entries) {
      return this.payments.filter(p => p.createdBy === userId);
    }
    return this.payments;
  }

  addPayment(userId: number, data: Omit<Payment, 'id' | 'createdAt' | 'isCorrected' | 'createdBy' | 'status'>) {
    if (!this.checkPermission(userId, 'add_payments')) throw new Error("Unauthorized");
    const user = this.users.find(u => u.id === userId)!;
    const payment: Payment = {
      id: generateId(this.payments),
      ...data,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      isCorrected: false,
      status: (user.role === UserRole.ADMIN || !user.permissions.require_admin_approval_for_payments) 
        ? TransactionStatus.APPROVED : TransactionStatus.PENDING
    };
    this.payments.push(payment);
    this.logAction(userId, 'REVENUE_ENTRY', 'payments', payment.id);
    return payment;
  }

  markPaymentCorrected(userId: number, id: number) {
    if (!this.checkPermission(userId, 'correct_records')) throw new Error("Unauthorized");
    const p = this.payments.find(p => p.id === id);
    if (p) {
      p.isCorrected = true;
      this.logAction(userId, 'DATA_CORRECTION', 'payments', id);
    }
  }

  // Expenses
  getExpenses(userId: number) {
    if (!this.checkPermission(userId, 'view_expenses')) return [];
    return this.expenses;
  }

  addExpense(userId: number, data: Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'status'>) {
    if (!this.checkPermission(userId, 'add_expenses')) throw new Error("Unauthorized");
    const user = this.users.find(u => u.id === userId)!;
    const expense: Expense = {
      id: generateId(this.expenses),
      ...data,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: (user.role === UserRole.ADMIN || !user.permissions.require_admin_approval_for_expenses) 
        ? TransactionStatus.APPROVED : TransactionStatus.PENDING
    };
    this.expenses.push(expense);
    this.logAction(userId, 'EXPENSE_AUTHORIZATION', 'expenses', expense.id);
    return expense;
  }

  getProperties() { return this.properties; }
  getUnits() { return this.units; }
  getLogs(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return [];
    if (user.role === UserRole.ADMIN || user.permissions.view_all_employee_logs) return this.logs;
    if (user.permissions.view_own_logs_only) return this.logs.filter(l => l.userId === userId);
    return [];
  }

  getFinancialSummary(userId: number) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const income = this.payments.filter(p => {
      const d = new Date(p.paymentDate);
      return !p.isCorrected && 
             p.status === TransactionStatus.APPROVED &&
             d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear;
    }).reduce((s, p) => s + p.amount, 0);

    const expense = this.expenses.filter(e => {
      const d = new Date(e.expenseDate);
      return e.status === TransactionStatus.APPROVED &&
             d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear;
    }).reduce((s, e) => s + e.amount, 0);

    return { 
      totalIncome: income, 
      totalExpenses: expense, 
      netProfit: income - expense, 
      expectedIncome: 0, 
      expectedExpense: 0, 
      expectedBalance: 0 
    };
  }
}

export const db = new MockDB();
