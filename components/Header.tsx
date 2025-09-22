
import React from 'react';
import { NAV_LINKS, AdminIcon, LogoutIcon, JaniLogo } from '../constants';
import { Page } from '../types';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
             <JaniLogo />
            <h1 className="text-2xl font-bold">Jani Pakwan Center</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.page)}
                className="flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
             <button onClick={() => onNavigate('ADMIN')} className="flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors">
                <AdminIcon/> Admin
            </button>
            <button onClick={onLogout} className="flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors">
                <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;