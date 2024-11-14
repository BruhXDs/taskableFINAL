import React, { useRef, useEffect } from 'react';
import { Check, MoreVertical, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, startOfToday, isSameDay } from 'date-fns';
import { TodoItem as TodoItemType } from '../types/todo';
import 'react-day-picker/dist/style.css';

interface Props {
  item: TodoItemType;
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const priorities = [
  { value: null, label: 'No Priority', icon: <AlertTriangle className="text-gray-400" size={16} /> },
  { value: 'high', label: 'High Priority', icon: <AlertTriangle className="text-red-500" size={16} /> },
  { value: 'medium', label: 'Medium Priority', icon: <AlertTriangle className="text-yellow-500" size={16} /> },
  { value: 'low', label: 'Low Priority', icon: <AlertTriangle className="text-blue-500" size={16} /> },
];

const css = `
  .rdp-day_today:not(.rdp-day_selected) { 
    background-color: #e5e7eb;
    font-weight: bold;
    border: 2px solid #3b82f6;
  }
  .dark .rdp-day_today:not(.rdp-day_selected) {
    background-color: #374151;
    border: 2px solid #60a5fa;
  }
`;

export default function TodoItem({ item, onUpdate, onKeyDown, onDelete, onDuplicate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = React.useState(false);

  useEffect(() => {
    if (item.isEmpty && inputRef.current) {
      inputRef.current.focus();
    }
  }, [item.isEmpty]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const newLevel = e.shiftKey ? Math.max(0, item.level - 1) : item.level + 1;
      onUpdate(item.id, { level: newLevel });
    } else {
      onKeyDown(e, item.id);
    }
  };

  const formatDueDate = () => {
    if (!item.dueDate) return null;
    try {
      const date = parseISO(item.dueDate);
      const dateStr = format(date, 'MMM d, yyyy');
      if (item.dueTime) {
        return `${dateStr} at ${format(parseISO(`${item.dueDate}T${item.dueTime}`), 'h:mm a')}`;
      }
      return dateStr;
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onUpdate(item.id, { dueDate: date.toISOString().split('T')[0] });
    } else {
      onUpdate(item.id, { dueDate: null, dueTime: undefined });
    }
    setIsDatePickerOpen(false);
  };

  const handleTimeSelect = (timeStr: string) => {
    onUpdate(item.id, { dueTime: timeStr });
  };

  const priorityInfo = item.priority ? priorities.find(p => p.value === item.priority) : priorities[0];
  const dueText = formatDueDate();
  const today = startOfToday();
  const selectedDate = item.dueDate ? parseISO(item.dueDate) : undefined;

  return (
    <div 
      className="group flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      style={{ marginLeft: `${item.level * 24}px` }}
    >
      <style>{css}</style>
      <button
        onClick={() => onUpdate(item.id, { completed: !item.completed })}
        className={`flex-shrink-0 w-5 h-5 rounded border transition-colors ${
          item.completed 
            ? 'border-blue-500 bg-blue-500' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
        }`}
      >
        {item.completed && <Check size={14} className="text-white" />}
      </button>

      <input
        ref={inputRef}
        value={item.title}
        onChange={(e) => onUpdate(item.id, { title: e.target.value, isEmpty: false })}
        onKeyDown={handleKeyDown}
        className={`flex-grow bg-transparent outline-none ${
          item.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'
        }`}
        placeholder="Type your task..."
      />

      <div className="flex items-center gap-2">
        {(dueText || item.priority) && (
          <div className="flex items-center gap-2 text-sm">
            {dueText && (
              <span className={`${
                item.dueDate && isSameDay(parseISO(item.dueDate), today)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {dueText}
              </span>
            )}
            {priorityInfo && priorityInfo.value && (
              <span className="flex items-center">
                {priorityInfo.icon}
              </span>
            )}
          </div>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>

          <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 z-50"
                sideOffset={5}
              >
                <Popover.Root open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <Popover.Trigger asChild>
                    <button
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDatePickerOpen(!isDatePickerOpen);
                      }}
                    >
                      <Calendar size={16} />
                      {item.dueDate ? 'Change due date' : 'Set due date'}
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50"
                      sideOffset={5}
                    >
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        defaultMonth={selectedDate || today}
                        className="dark:text-white"
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>

                <Popover.Root open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                  <Popover.Trigger asChild>
                    <button
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTimePickerOpen(!isTimePickerOpen);
                      }}
                    >
                      <Clock size={16} />
                      {item.dueTime ? 'Change time' : 'Set time'}
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50"
                      sideOffset={5}
                    >
                      <input
                        type="time"
                        value={item.dueTime || ''}
                        onChange={(e) => handleTimeSelect(e.target.value)}
                        className="w-full p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>

                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                {priorities.map(({ value, label, icon }) => (
                  <DropdownMenu.Item
                    key={value || 'none'}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => onUpdate(item.id, { priority: value })}
                  >
                    {icon}
                    {label}
                  </DropdownMenu.Item>
                ))}

                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => onDuplicate(item.id)}
                >
                  Duplicate task
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  );
}