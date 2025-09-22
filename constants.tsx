import React from 'react';
import { NavLink, Page, StatCardData } from './types';

// SVG Icons
export const JaniLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" className="inline-block mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 L90 35 L90 85 L50 110 L10 85 L10 35 Z" fill="#FBBF24"/>
        <path d="M50 20 L80 40 L80 80 L50 100 L20 80 L20 40 Z" stroke="#8B5CF6" strokeWidth="5"/>
        <text x="50" y="68" fontFamily="Arial, sans-serif" fontSize="30" fill="#4C1D95" textAnchor="middle" fontWeight="bold">J</text>
    </svg>
);
export const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
export const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
export const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
export const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
export const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
export const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
export const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const MoneyBillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-7 6h7m-7 4h7m-7 4h7M5 12H4a1 1 0 00-1 1v6a1 1 0 001 1h1v-9zM20 12h-1v9h1a1 1 0 001-1v-6a1 1 0 00-1-1z" /></svg>;


// Navigation Data
export const NAV_LINKS: NavLink[] = [
  { label: 'New Order', icon: <PlusCircleIcon />, page: 'NEW_ORDER' },
  { label: 'Customer History', icon: <HistoryIcon />, page: 'CUSTOMER_HISTORY' },
  { label: 'Expenses', icon: <CreditCardIcon />, page: 'EXPENSES' },
  { label: 'Income', icon: <CashIcon />, page: 'INCOME' },
  { label: 'Supply Parties', icon: <UsersIcon />, page: 'SUPPLY_PARTIES' },
];

export const DASHBOARD_STATS: StatCardData[] = [
    { title: "Today's Orders", value: '0', icon: <ShoppingCartIcon />, gradient: 'from-blue-500 to-indigo-600' },
    { title: "Today's Sales", value: 'PKR 0', icon: <ChartBarIcon />, gradient: 'from-pink-500 to-rose-500' },
    { title: "Pending Amount", value: 'PKR 0', icon: <ClockIcon />, gradient: 'from-cyan-400 to-sky-500' },
    { title: "Today's Expenses", value: 'PKR 0', icon: <MoneyBillIcon />, gradient: 'from-emerald-400 to-teal-500' },
];