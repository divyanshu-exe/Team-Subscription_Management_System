// OWNER: FE-1
// PURPOSE: Shared TS types matching API contract and database models

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  customerId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductType = 'service' | 'consumable';

export interface Variant {
  id: number;
  productId: number;
  attribute: string;
  value: string;
  extraPrice: number;
}

export interface Product {
  id: number;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string | null;
  isActive: boolean;
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

export type TaxType = 'PERCENT' | 'FIXED';

export interface Tax {
  id: number;
  name: string;
  type: TaxType;
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PlanPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

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
  createdAt: string;
  updatedAt: string;
}

export type DiscountType = 'PERCENT' | 'FIXED';
export type DiscountAppliesTo = 'PRODUCTS' | 'SUBSCRIPTION';

export interface DiscountProduct {
  id: number;
  discountId: number;
  productId: number;
  product?: { id: number; name: string };
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
  products?: DiscountProduct[];
  productIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationTemplateLine {
  id: number;
  templateId: number;
  productId: number;
  product?: Product;
  variantId?: number | null;
  variant?: Variant | null;
  quantity: number;
}

export interface QuotationTemplate {
  id: number;
  name: string;
  planId: number;
  plan?: Plan;
  validityDays: number;
  lines?: QuotationTemplateLine[];
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'CLOSED';

export interface SubscriptionLine {
  id: number;
  subscriptionId: number;
  productId: number;
  product?: Product;
  variantId?: number | null;
  variant?: Variant | null;
  quantity: number;
  unitPrice: number;
  taxId?: number | null;
  tax?: Tax | null;
  amount: number;
}

export interface StatusHistory {
  id: number;
  entityType: 'SUBSCRIPTION' | 'INVOICE';
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
  createdBy?: { id: number; name: string; email: string };
  lines?: SubscriptionLine[];
  invoices?: Invoice[];
  history?: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface InvoiceLine {
  id: number;
  invoiceId: number;
  productId?: number | null;
  product?: Product | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  amount: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';

export interface Payment {
  id: number;
  invoiceId: number;
  invoice?: Invoice;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  note?: string | null;
  recordedById: number;
  recordedBy?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  number: string;
  subscriptionId: number;
  subscription?: Subscription;
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
  daysOverdue?: number;
  discountId?: number | null;
  discount?: Discount | null;
  lines?: InvoiceLine[];
  payments?: Payment[];
  history?: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BillingRunResult {
  total: number;
  created: number;
  skippedExisting: number;
  errors: Array<{ subscriptionId: number; error: string }>;
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
    cancelled: number;
  };
  paymentsByMethod: Array<{
    method: PaymentMethod;
    amount: number;
    count: number;
  }>;
}
