import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileSettingsModal from './ProfileSettingsModal';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = "JLPT Study", showNav = true }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_id')
        .eq('id', user.id)
        .single();
      if (data) {
        setAvatarId(data.avatar_id);
      }
    }
  };

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
          <div className="flex items-center">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center justify-center rounded-xl h-10 w-10 bg-gray-50 dark:bg-white/5 text-charcoal dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
            >
              {avatarId ? (
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarId}&backgroundColor=transparent`}
                  alt="Avatar"
                  className="size-7 object-contain"
                />
              ) : (
                <span className="material-symbols-outlined !text-2xl opacity-40">person</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {isProfileOpen && (
        <ProfileSettingsModal
          onClose={() => setIsProfileOpen(false)}
          onUpdate={() => {
            // Potential global state update if needed
            window.location.reload(); // Quick way to refresh all stats
          }}
        />
      )}

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
