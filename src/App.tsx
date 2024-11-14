import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { TodoItem as TodoItemType } from './types/todo';
import TodoItem from './components/TodoItem';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import ListTitle from './components/ListTitle';
import EmptyState from './components/EmptyState';
import { useSupabase } from './hooks/useSupabase';
import { useLocalStorage } from './hooks/useLocalStorage';

interface TodoList {
  id: string;
  name: string;
  todos: TodoItemType[];
}

export default function App() {
  const { isSignedIn, user } = useUser();
  const supabase = useSupabase();
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Set up real-time subscription
  useEffect(() => {
    if (isSignedIn && user && supabase) {
      const channel = supabase
        .channel('todo_lists_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todo_lists',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchTodoLists();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSignedIn, user, supabase]);

  useEffect(() => {
    if (isSignedIn && user && supabase) {
      fetchTodoLists();
    } else if (!isInitialized) {
      const defaultList = {
        id: uuidv4(),
        name: 'My Tasks',
        todos: []
      };
      setLists([defaultList]);
      setActiveListId(defaultList.id);
      setIsInitialized(true);
    }
  }, [isSignedIn, user, supabase]);

  const fetchTodoLists = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('todo_lists')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedLists = data.map(list => ({
          ...list,
          todos: list.todos as TodoItemType[]
        }));
        setLists(formattedLists);
        if (!activeListId) {
          setActiveListId(formattedLists[0].id);
        }
      } else {
        const defaultList = {
          id: uuidv4(),
          name: 'My Tasks',
          todos: []
        };
        await createList(defaultList);
        setLists([defaultList]);
        setActiveListId(defaultList.id);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching todo lists:', error);
    }
  };

  const syncList = async (listId: string, updatedTodos: TodoItemType[]) => {
    if (!isSignedIn || !supabase) return;

    try {
      const { error } = await supabase
        .from('todo_lists')
        .update({ 
          todos: updatedTodos,
          updated_at: new Date().toISOString()
        })
        .eq('id', listId);

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing todos:', error);
    }
  };

  const createList = async (list: TodoList) => {
    if (isCreatingList) return;
    setIsCreatingList(true);

    try {
      if (!isSignedIn) {
        setLists(prev => [...prev, list]);
        setActiveListId(list.id);
      } else if (supabase) {
        const { error } = await supabase
          .from('todo_lists')
          .insert([{
            id: list.id,
            name: list.name,
            todos: list.todos,
            user_id: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        await fetchTodoLists();
        setActiveListId(list.id);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsCreatingList(false);
    }
  };

  const deleteList = async (id: string) => {
    if (!isSignedIn) {
      setLists(prev => prev.filter(list => list.id !== id));
      if (activeListId === id) {
        setActiveListId(lists[0]?.id || '');
      }
      return;
    }

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('todo_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTodoLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const updateListTitle = async (newTitle: string) => {
    const updatedLists = lists.map(list =>
      list.id === activeListId ? { ...list, name: newTitle } : list
    );
    setLists(updatedLists);

    if (!isSignedIn || !supabase) return;

    try {
      const { error } = await supabase
        .from('todo_lists')
        .update({ 
          name: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeListId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating list title:', error);
    }
  };

  const activeList = lists.find(list => list.id === activeListId);
  const todos = activeList?.todos || [];

  const handleCreateTodo = () => {
    const newTodo: TodoItemType = {
      id: uuidv4(),
      title: '',
      completed: false,
      level: 0,
      isEmpty: true
    };

    const updatedTodos = [...todos, newTodo];
    const updatedLists = lists.map(list =>
      list.id === activeListId ? { ...list, todos: updatedTodos } : list
    );

    setLists(updatedLists);
    syncList(activeListId, updatedTodos);
  };

  const handleUpdateTodo = (id: string, updates: Partial<TodoItemType>) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    );
    
    const updatedLists = lists.map(list =>
      list.id === activeListId ? { ...list, todos: updatedTodos } : list
    );

    setLists(updatedLists);
    syncList(activeListId, updatedTodos);
  };

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    const updatedLists = lists.map(list =>
      list.id === activeListId ? { ...list, todos: updatedTodos } : list
    );

    setLists(updatedLists);
    syncList(activeListId, updatedTodos);
  };

  const handleDuplicateTodo = (id: string) => {
    const todoToDuplicate = todos.find(todo => todo.id === id);
    if (!todoToDuplicate) return;

    const newTodo: TodoItemType = {
      ...todoToDuplicate,
      id: uuidv4(),
      title: `${todoToDuplicate.title} (copy)`
    };

    const updatedTodos = [...todos, newTodo];
    const updatedLists = lists.map(list =>
      list.id === activeListId ? { ...list, todos: updatedTodos } : list
    );

    setLists(updatedLists);
    syncList(activeListId, updatedTodos);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTodo();
    } else if (e.key === 'Backspace' && todos.find(t => t.id === id)?.title === '') {
      e.preventDefault();
      handleDeleteTodo(id);
    }
  };

  const handleCreateList = () => {
    if (isCreatingList) return;

    const newList = {
      id: uuidv4(),
      name: 'Untitled List',
      todos: []
    };
    createList(newList);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="h-full flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      <Sidebar
        isOpen={isSidebarOpen}
        lists={lists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onCreateList={handleCreateList}
        onDeleteList={deleteList}
      />

      <main className={`pt-24 pb-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-3xl mx-auto px-4">
          {activeList && (
            <>
              <ListTitle
                title={activeList.name}
                onUpdateTitle={updateListTitle}
              />
              {todos.length === 0 ? (
                <EmptyState onCreateTodo={handleCreateTodo} />
              ) : (
                <div className="space-y-1">
                  {todos.map(todo => (
                    <TodoItem
                      key={todo.id}
                      item={todo}
                      onUpdate={handleUpdateTodo}
                      onKeyDown={handleKeyDown}
                      onDelete={handleDeleteTodo}
                      onDuplicate={handleDuplicateTodo}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Settings
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />
    </div>
  );
}