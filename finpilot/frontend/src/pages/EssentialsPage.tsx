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
    <div className="space-y-5 text-content-primary max-w-2xl">
      <div className="pb-4 border-b border-boundary-subtle">
        <p className="text-[11px] uppercase tracking-[0.08em] font-bold text-content-muted mb-1">Administration</p>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-ochreDeep dark:text-brand-ochre" />
          Operations checklist
        </h1>
        <p className="text-xs text-content-secondary mt-1">A focused checklist for showroom management and logistics follow-up.</p>
      </div>

      <div className="bg-surface border border-boundary-subtle rounded-lg p-5 space-y-4">
        <form onSubmit={addTodo} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new operations task..."
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            className="flex-1 bg-surface-secondary border border-boundary-strong rounded-lg px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-brand-ochre"
          />
          <button type="submit" className="px-4 py-2 bg-brand-ochre hover:bg-brand-ochreDark text-stone-950 font-semibold text-xs rounded-lg transition flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        <div className="space-y-2">
          {todos.map(t => (
            <div key={t.id} className="p-3 bg-surface-secondary/60 border border-boundary-subtle rounded-lg flex items-center justify-between text-xs transition">
              <button
                type="button"
                onClick={() => toggleTodo(t.id)} 
                className="flex items-center gap-3 text-left flex-1"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center transition ${t.done ? 'bg-status-success border-status-success text-white' : 'border-boundary-strong'}`}>
                  {t.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
                <span className={`${t.done ? 'line-through text-content-muted' : 'text-content-primary font-medium'}`}>
                  {t.text}
                </span>
              </button>
              <button type="button" onClick={() => deleteTodo(t.id)} className="text-content-muted hover:text-status-danger p-1" aria-label={`Delete task: ${t.text}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
