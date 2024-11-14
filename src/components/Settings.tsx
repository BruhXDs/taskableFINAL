import React from 'react';
import { Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { UserButton, useUser, SignInButton } from '@clerk/clerk-react';

interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Settings({ isDark, onToggleTheme }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isSignedIn } = useUser();

  return (
    <div className="fixed bottom-4 left-4 z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
      >
        <SettingsIcon size={20} className="text-gray-700 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 min-w-[200px] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun size={20} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon size={20} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Account</span>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}