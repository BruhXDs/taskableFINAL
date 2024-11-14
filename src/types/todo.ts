export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  level: number;
  isEmpty?: boolean;
  dueDate?: string | null;
  dueTime?: string;
  priority?: 'high' | 'medium' | 'low' | null;
}