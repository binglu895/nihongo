
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col gap-8 px-10 py-12 text-center bg-white dark:bg-background-dark/50 border-t border-gray-100 dark:border-white/5 mt-auto">
      <div className="flex flex-wrap items-center justify-center gap-12">
        <a className="text-ghost-grey hover:text-primary dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors" href="#">Privacy Policy</a>
        <a className="text-ghost-grey hover:text-primary dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors" href="#">Terms of Service</a>
        <a className="text-ghost-grey hover:text-primary dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors" href="#">Support Center</a>
        <a className="text-ghost-grey hover:text-primary dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors" href="#">Contact</a>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-ghost-grey dark:text-gray-500 text-xs font-normal">© 2024 JLPT Minimalist. Designed for focus.</p>
        <div className="flex justify-center gap-4 mt-2">
          <div className="w-8 h-[2px] bg-primary/20"></div>
          <div className="w-8 h-[2px] bg-primary"></div>
          <div className="w-8 h-[2px] bg-primary/20"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
