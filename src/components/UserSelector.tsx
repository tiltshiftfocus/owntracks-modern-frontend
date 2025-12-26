import { useEffect, useState } from 'react';
import { User as UserIcon, ChevronDown } from 'lucide-react';
import type { User } from '../types';

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User | null) => void;
}

export default function UserSelector({
  users,
  selectedUser,
  onSelectUser
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    onSelectUser(user);
    setIsOpen(false);
  };

  const displayText = selectedUser
    ? selectedUser.name
    : 'Select user';

  const deviceCount = selectedUser ? selectedUser.devices.length : 0;

  return (
    <div className="user-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 w-full"
      >
        <UserIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
        <span className="flex-1 text-left text-xs sm:text-sm font-medium truncate">
          {displayText}
        </span>
        {selectedUser && deviceCount > 0 && (
          <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {deviceCount} {deviceCount === 1 ? 'device' : 'devices'}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-80 overflow-y-auto custom-scrollbar">
          <div className="p-2">
            {users.map((user) => {
              const isSelected = selectedUser?.name === user.name;

              return (
                <button
                  key={user.name}
                  onClick={() => handleSelect(user)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 rounded transition-colors flex items-center gap-2 ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <UserIcon className="w-3 h-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {user.devices.length} {user.devices.length === 1 ? 'device' : 'devices'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
