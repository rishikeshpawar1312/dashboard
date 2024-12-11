import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, CheckCircle, Circle, ListTodo, Loader2 } from 'lucide-react';

type Todo = {
  deleting: boolean;
  id: string;
  title: string;
  completed: boolean;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('/api/todos');
      setTodos(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (title.trim()) {
      setIsAdding(true);
      try {
        const response = await axios.post('/api/todos', { title });
        setTodos(prev => [{ ...response.data, new: true }, ...prev]);
        setTitle('');
      } finally {
        setIsAdding(false);
      }
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const response = await axios.put('/api/todos', { id, completed: !completed });
    setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
  };

  const deleteTodo = async (id: string) => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    setTodos(prev => prev.map((todo, index) => 
      index === todoIndex ? { ...todo, deleting: true } : todo
    ));

    await axios.delete('/api/todos', { data: { id } });

    setTimeout(() => {
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAdding) {
      addTodo();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <ListTodo className="w-6 h-6 text-primary mr-2" />
          <h2 className="text-2xl font-bold text-card-foreground">My Tasks</h2>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="w-full pl-3 pr-10 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground 
              border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent 
              transition-all duration-200"
          />
          <button
            onClick={addTodo}
            disabled={isAdding || !title.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <PlusCircle className={`w-5 h-5 ${title.trim() ? 'text-primary hover:text-primary/80' : 'text-muted'} 
                transition-colors duration-200`} />
            )}
          </button>
        </div>

        <div className="max-h-[240px] overflow-y-auto">
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className={`group flex items-center p-3 rounded-lg border border-border
                  ${todo.completed ? 'bg-muted/50' : 'bg-card'} 
                  ${todo.deleting ? 'animate-out fade-out slide-out-to-left duration-300' : 'animate-in fade-in-0 duration-200'} 
                  ${(todo as any).new ? 'animate-in slide-in-from-top duration-300' : ''} 
                  transition-all hover:shadow-md`}
              >
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className="flex items-center flex-1"
                >
                  {todo.completed ? (
                    <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground mr-3 group-hover:text-primary transition-colors" />
                  )}
                  <span className={`text-sm ${todo.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'} 
                    transition-colors duration-200`}>
                    {todo.title}
                  </span>
                </button>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80 transition-colors" />
                </button>
              </li>
            ))}
          </ul>

          {todos.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground animate-in fade-in-0 duration-300">
              No tasks yet. Add one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
