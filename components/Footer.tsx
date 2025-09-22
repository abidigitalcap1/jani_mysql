
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm">
        Copyright &copy; {currentYear} Made With <span className="text-red-500">&hearts;</span> Miraj Sol
      </div>
    </footer>
  );
};

export default Footer;