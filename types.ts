export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number; // GST 8% usually in Maldives, but keeping flexible
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Settings {
  businessName: string;
  businessSubtitle: string;
  address: string;
  email: string;
  phone: string;
  gstTin: string;
  logoUrl?: string;
}

export type ViewState = 'dashboard' | 'invoices' | 'create' | 'edit' | 'view' | 'customers' | 'create-customer' | 'edit-customer' | 'settings' | 'reports' | 'users' | 'create-user' | 'edit-user';

export interface ViewConfig {
  view: ViewState;
  invoiceId?: string;
  customerId?: string;
  userId?: string;
}