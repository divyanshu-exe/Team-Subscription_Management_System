// OWNER: FE-1 & FE-2
// PURPOSE: Shared TypeScript types matching API contract and data model

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type TaxType = 'PERCENT' | 'FIXED';

export type PlanPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type DiscountType = 'FIXED' | 'PERCENT';

export type DiscountAppliesTo = 'PRODUCTS' | 'SUBSCRIPTION';

export type SubscriptionStatus =
  | 'DRAFT'
  | 'QUOTATION'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'CLOSED';

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CHEQUE';

export type StatusEntityType = 'SUBSCRIPTION' | 'INVOICE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  customerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id?: number;
  productId?: number;
  attribute: string;
  value: string;
  extraPrice: number;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes?: string | null;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Tax {
  id: number;
  name: string;
  type: TaxType;
  value: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  period: PlanPeriod;
  minQuantity: number;
  availableFrom: string;
  availableTo: string;
  autoCloseAtEnd: boolean;
  closableEarly: boolean;
  pausable: boolean;
  renewable: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationTemplateLine {
  id?: number;
  templateId?: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface QuotationTemplate {
  id: number;
  name: string;
  planId: number;
  plan?: Plan;
  validityDays: number;
  lines?: QuotationTemplateLine[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionLine {
  id?: number;
  subscriptionId?: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  unitPrice: number;
  taxId?: number | null;
  amount: number;
  product?: Product;
  variant?: ProductVariant | null;
  tax?: Tax | null;
}

export interface StatusHistory {
  id: number;
  entityType: StatusEntityType;
  entityId: number;
  fromStatus: string;
  toStatus: string;
  changedById: number;
  changedBy?: { id: number; name: string };
  changedAt: string;
}

export interface Subscription {
  id: number;
  number: string;
  customerId: number;
  customer?: Customer;
  planId: number;
  plan?: Plan;
  templateId?: number | null;
  template?: QuotationTemplate | null;
  startDate: string;
  expiryDate: string;
  paymentTermsDays: number;
  paymentTermsLabel: string;
  status: SubscriptionStatus;
  isPaused: boolean;
  nextInvoiceDate?: string | null;
  createdById: number;
  createdBy?: { id: number; name: string };
  lines?: SubscriptionLine[];
  history?: StatusHistory[];
  invoices?: Invoice[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Discount {
  id: number;
  name: string;
  type: DiscountType;
  value: number;
  minPurchase?: number | null;
  minQuantity?: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  appliesTo: DiscountAppliesTo;
  isActive: boolean;
  productIds?: number[];
  products?: { productId: number; product?: Product }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceLine {
  id?: number;
  invoiceId?: number;
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  amount: number;
  product?: Product | null;
}

export interface Invoice {
  id: number;
  number: string;
  subscriptionId: number;
  subscription?: { number: string; plan?: Plan };
  customerId: number;
  customer?: Customer;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balance?: number;
  discountId?: number | null;
  discount?: Discount | null;
  lines?: InvoiceLine[];
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  invoice?: { number: string; total: number; amountPaid: number };
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  note?: string | null;
  recordedById: number;
  recordedBy?: { id: number; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: any[];
}

export interface DashboardSummary {
  activeSubscriptions: number;
  revenueReceived: number;
  amountOutstanding: number;
  overdueCount: number;
  overdueAmount: number;
  invoiceCounts: {
    draft: number;
    confirmed: number;
    paid: number;
  };
  paymentsByMethod: {
    method: PaymentMethod;
    amount: number;
  }[];
}
