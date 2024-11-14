import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onCreateTodo: () => void;
}

export default function EmptyState({ onCreateTodo }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-blue-50 rounded-full p-4 mb-6">
        <Plus size={32} className="text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create your first task</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Get started by creating a new task in your list. Stay organized and track your progress.
      </p>
      <button
        onClick={onCreateTodo}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        Create Task
      </button>
    </div>
  );
}