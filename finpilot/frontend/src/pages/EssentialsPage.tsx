import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const EssentialsPage: React.FC = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: "Verify Chittagong Port customs duty receipt for PO-2026-ASUS-091", done: true },
    { id: 2, text: "Schedule Steadfast Courier pickup for Chittagong Tech Point batch", done: true },
    { id: 3, text: "Reconcile Banani Vault showroom cash drawer with morning deposit", done: true },
    { id: 4, text: "Follow up overdue 30-day payment collection with TechLand BD", done: false },
    { id: 5, text: "Prepare quotation for Daffodil University Robotics Lab 10x RTX 4070 Ti", done: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: newTodo.trim(), done: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-blue-500" />
          Essentials: To-Do & Store Operations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Internal operations checklist for showroom management and logistics fulfillment
        </p>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={addTodo} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new operations task..."
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow">
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        <div className="space-y-2">
          {todos.map(t => (
            <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs transition">
              <div 
                onClick={() => toggleTodo(t.id)} 
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${t.done ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'}`}>
                  {t.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className={`${t.done ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                  {t.text}
                </span>
              </div>
              <button onClick={() => deleteTodo(t.id)} className="text-slate-500 hover:text-rose-400 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
