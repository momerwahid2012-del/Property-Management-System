
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface UserPermissions {
  // 1. Data Creation
  add_properties: boolean;
  add_units: boolean;
  add_tenants: boolean;
  add_tenant_notes: boolean;
  add_payments: boolean;
  add_expenses: boolean;
  add_expense_categories: boolean;
  add_employee_accounts: boolean;
  
  // 2. Data Editing
  edit_property_details: boolean;
  edit_unit_details: boolean;
  edit_tenant_details: boolean;
  change_tenant_status: boolean;
  edit_payments: boolean;
  edit_expenses: boolean;
  correct_records: boolean;

  // 3. Deletion/Control
  delete_units: boolean;
  delete_payments: boolean;
  delete_expenses: boolean;
  archive_tenants: boolean;
  force_delete_property: boolean;

  // 4. Data Visibility
  view_properties: boolean;
  view_units: boolean;
  view_tenants: boolean;
  view_tenant_contact_details: boolean;
  view_payments: boolean;
  view_expenses: boolean;
  view_financial_totals: boolean;
  view_profit_and_loss: boolean;
  view_expected_next_month_report: boolean;

  // 5. Reporting
  view_reports: boolean;
  view_charts: boolean;
  view_monthly_reports: boolean;
  view_yearly_reports: boolean;
  export_reports: boolean;

  // 6. Management
  view_employee_list: boolean;
  edit_employee_permissions: boolean;
  activate_deactivate_employees: boolean;
  reset_employee_passwords: boolean;

  // 7. Audit
  view_activity_logs: boolean;
  view_own_logs_only: boolean;
  view_all_employee_logs: boolean;

  // 8. Time/Date Restrictions
  allow_backdated_entries: boolean;
  backdate_limit_days: number;
  lock_previous_month_records: boolean;
  edit_only_same_day_records: boolean;

  // 9. Scope
  restrict_to_assigned_properties: boolean;
  restrict_to_assigned_units: boolean;
  restrict_to_assigned_tenants: boolean;
  view_only_own_entries: boolean;

  // 10. Validation
  require_admin_approval_for_payments: boolean;
  require_admin_approval_for_expenses: boolean;
  require_mandatory_notes_on_edits: boolean;
  require_reason_for_corrections: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  assignedPropertyIds: number[];
  permissions: UserPermissions;
}

export interface Property {
  id: number;
  name: string;
  location: string;
  type: string;
}

export interface Unit {
  id: number;
  propertyId: number;
  unitNumber: string;
  rentAmount: number;
  maxTenants: number | null;
}

export enum TenantStatus {
  ACTIVE = 'active',
  LEFT = 'left'
}

export interface Tenant {
  id: number;
  fullName: string;
  autoId: string; // Replaces manually entered email/idNumber for identification
  phone: string;
  moveInDate: string;
  unitId: number;
  status: TenantStatus;
}

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved'
}

export interface Payment {
  id: number;
  tenantId: number;
  unitId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  createdBy: number;
  createdAt: string;
  isCorrected: boolean;
  status: TransactionStatus;
  notes?: string;
}

export enum ExpenseCategory {
  MAINTENANCE = 'maintenance',
  ELECTRICITY = 'electricity',
  WATER = 'water',
  OTHER = 'other'
}

export interface Expense {
  id: number;
  propertyId: number;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string;
  createdBy: number;
  createdAt: string;
  status: TransactionStatus;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  tableName: string;
  recordId: number;
  timestamp: string;
}
