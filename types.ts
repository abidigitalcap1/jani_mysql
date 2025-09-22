import React from 'react';

export type Page = 'DASHBOARD' | 'NEW_ORDER' | 'CUSTOMER_HISTORY' | 'EXPENSES' | 'INCOME' | 'SUPPLY_PARTIES' | 'ADMIN';

export interface NavLink {
  label: string;
  icon: React.ReactNode;
  page: Page;
}

export interface StatCardData {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}

// Database-related types
export interface Customer {
  customer_id: number;
  name: string;
  phone: string;
  address: string;
}

export interface CustomerHistoryEntry {
  customer_id: number;
  name: string;
  phone: string;
  address: string;
  total_orders: number;
  total_spent: number;
  total_pending: number;
  last_order_date: string;
}

export interface MenuItem {
  item_id: number;
  name: string;
  price: number;
}

export interface OrderItemForm {
  item_id: number | null;
  custom_item_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  order_id: number;
  customer_id: number;
  order_type: 'Online' | 'Local';
  order_date: string;
  delivery_date: string;
  delivery_time?: string;
  total_amount: number;
  advance_payment: number;
  remaining_amount: number;
  delivery_address?: string;
  notes?: string;
  status: 'Pending' | 'Partially_Paid' | 'Fulfilled';
}

export interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  payment_date: string;
  notes?: string;
}

export interface Expense {
  expense_id: number;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
}

export interface Party {
    id: number;
    party_name: string;
    supply_date: string;
    details: string;
    total_amount: number;
}

export interface PartyPayment {
    id: number;
    party_id: number;
    payment_date: string;
    amount_paid: number;
    note?: string;
}

export interface SupplyParty {
  id: number;
  party_name: string;
  supply_date: string;
  total_amount: number;
  amount_paid: number;
  pending_amount: number;
}

export interface OrderWithCustomer extends Order {
  customer_name: string;
}

export interface OrderItemWithMenuItem {
  order_item_id: number;
  quantity: number;
  unit_price: number;
  custom_item_name: string | null;
  menu_item_name: string | null;
}

export interface LedgerEntry {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}