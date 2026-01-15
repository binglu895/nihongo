
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = "JLPT Study", showNav = true }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-solid border-gray-200 dark:border-white/10 px-6 md:px-10 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => navigate('/dashboard')}
      >
        <div className="text-primary group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined !text-3xl">school</span>
        </div>
        <h2 className="text-charcoal dark:text-white text-lg font-bold tracking-tight uppercase">NihonGo</h2>
      </div>
      
      <div className="flex items-center gap-6">
        {showNav && (
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-ghost-grey dark:text-gray-400">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/progress" className="hover:text-primary transition-colors">Progress</Link>
            <Link to="/settings" className="hover:text-primary transition-colors">Settings</Link>
          </nav>
        )}
        <div className="flex items-center gap-4">
          <Link to="/settings" className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-white/10 text-charcoal dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined !text-2xl">account_circle</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
             <img 
               src="https://picsum.photos/seed/user123/100/100" 
               alt="User profile" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
