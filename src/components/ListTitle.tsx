import React, { useRef, useEffect } from 'react';

interface Props {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
}

export default function ListTitle({ title, onUpdateTitle }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (title === 'Untitled List' && inputRef.current) {
      inputRef.current.select();
    }
  }, [title]);

  return (
    <div className="mb-8">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => onUpdateTitle(e.target.value)}
        className="text-2xl font-bold text-gray-900 dark:text-white w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
        placeholder="Untitled List"
      />
    </div>
  );
}