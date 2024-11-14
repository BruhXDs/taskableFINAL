import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TodoList } from '../types/todo';

interface Props {
  isOpen: boolean;
  lists: TodoList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onCreateList: () => void;
  onDeleteList: (id: string) => void;
}

export default function Sidebar({ isOpen, lists, activeListId, onSelectList, onCreateList, onDeleteList }: Props) {
  return (
    <div 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-2">
        <button
          onClick={onCreateList}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Create new list"
        >
          <Plus size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        <div className="mt-4 space-y-1">
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center group"
            >
              <button
                onClick={() => onSelectList(list.id)}
                className={`flex-grow px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                  activeListId === list.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {list.name}
              </button>
              <button
                onClick={() => onDeleteList(list.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-opacity"
                title="Delete list"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}