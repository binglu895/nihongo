import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = "JLPT Study", showNav = true }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Progress', path: '/progress' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <>
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

        <div className="flex items-center gap-4 md:gap-6">
          {showNav && (
            <>
              <nav className="hidden md:flex gap-8 text-sm font-semibold text-ghost-grey dark:text-gray-400">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="hover:text-primary transition-colors">{link.name}</Link>
                ))}
              </nav>
              <button
                className="md:hidden flex items-center justify-center p-2 text-ghost-grey dark:text-gray-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="material-symbols-outlined !text-3xl">
                  {isMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </>
          )}
          <div className="flex items-center gap-4">
            <Link to="/settings" className="hidden sm:flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-white/10 text-charcoal dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
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

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <nav className="absolute top-[72px] left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/10 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-lg font-bold text-charcoal dark:text-white hover:text-primary transition-colors flex items-center justify-between"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
                <span className="material-symbols-outlined text-ghost-grey/30">chevron_right</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
