import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Tag, 
  Bell, 
  Check, 
  User, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { todosApi, notificationsApi, DbTodo } from '../api';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup, TabItem } from '../components/common/TabGroup';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

export const EssentialsPage: React.FC = () => {
  const { notifications } = useStore();

  // Current logged in user
  const currentLoggedUser = (() => {
    try {
      const saved = localStorage.getItem('now_or_never_logged_user') || localStorage.getItem('dhaka_silicon_logged_user_v2') || localStorage.getItem('dhaka_silicon_logged_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();
  const currentUserName = currentLoggedUser?.name || 'Shahed Rahman Somoy';

  // Tasks state
  const [tasks, setTasks] = useState<DbTodo[]>([
    {
      id: 'todo-001',
      title: 'Verify Chittagong Port customs duty receipt for PO-2026-ASUS-091',
      description: 'Ensure bill of lading and AIT receipts match incoming GPU container #BD-904',
      category: 'Compliance',
      priority: 'urgent',
      dueDate: '2026-10-20',
      isCompleted: 0,
      completedBy: null,
      completedAt: null,
      createdBy: 'Shahed Rahman Somoy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'todo-002',
      title: 'Audit Banani Central Vault GPU serial numbers',
      description: 'Cross-check physical RTX 4070 Ti barcode serials against supplier manifest',
      category: 'Inventory',
      priority: 'high',
      dueDate: '2026-10-21',
      isCompleted: 1,
      completedBy: 'Shahed Rahman Somoy',
      completedAt: '2026-10-18',
      createdBy: 'Shahed Rahman Somoy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'todo-003',
      title: 'Follow up with Apex Computer Systems wholesale quotation',
      description: 'Client requested 2% wholesale rebate on 20 units of RTX 4080 Super',
      category: 'Sales',
      priority: 'medium',
      dueDate: '2026-10-20',
      isCompleted: 0,
      completedBy: null,
      completedAt: null,
      createdBy: 'Shahed Rahman Somoy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'todo-004',
      title: 'Daily Cash Drawer Count Reconciliation',
      description: 'Count physical notes in Banani Vault register drawer against POS receipts',
      category: 'Finance',
      priority: 'high',
      dueDate: '2026-10-19',
      isCompleted: 1,
      completedBy: 'Shahed Rahman Somoy',
      completedAt: '2026-10-19',
      createdBy: 'Shahed Rahman Somoy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'urgent'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Inventory');
  const [taskPriority, setTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [broadcastAlert, setBroadcastAlert] = useState<{ title: string; overview: string } | null>(null);

  // Load from DB
  const loadTasksFromDb = async () => {
    try {
      const res = await todosApi.getAll();
      if (Array.isArray(res) && res.length > 0) {
        setTasks(res);
      }
    } catch (e) {
      console.warn('Could not fetch todos from db-server:', e);
    }
  };

  useEffect(() => {
    loadTasksFromDb();
  }, []);

  // Handle Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTaskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim() || 'General operations checkpoint and follow-up.',
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate || 'Today',
      createdBy: currentUserName
    };

    try {
      // 1. Create in SQLite Database
      const created = await todosApi.create(newTaskData);
      setTasks(prev => [created, ...prev]);

      // 2. Broadcast notification alert with overview to all users
      const overviewText = `${newTaskData.description} (Priority: ${newTaskData.priority.toUpperCase()} · Due: ${newTaskData.dueDate} · By: ${currentUserName})`;
      setBroadcastAlert({
        title: newTaskData.title,
        overview: overviewText
      });

      // Clear form & close modal
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setTaskPriority('medium');
      setShowAddModal(false);

      // Auto-hide broadcast alert after 7 seconds
      setTimeout(() => setBroadcastAlert(null), 7000);
    } catch (err: any) {
      console.warn('Error creating task:', err);
      // Local fallback
      const localTask: DbTodo = {
        id: `todo-${Date.now()}`,
        ...newTaskData,
        isCompleted: 0,
        completedBy: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks(prev => [localTask, ...prev]);
      setBroadcastAlert({
        title: newTaskData.title,
        overview: `${newTaskData.description} (Priority: ${newTaskData.priority.toUpperCase()} · Due: ${newTaskData.dueDate})`
      });
      setShowAddModal(false);
      setTimeout(() => setBroadcastAlert(null), 7000);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (task: DbTodo) => {
    const newStatus = task.isCompleted ? 0 : 1;
    const now = new Date().toISOString();

    setTasks(prev => prev.map(t => t.id === task.id ? {
      ...t,
      isCompleted: newStatus,
      completedBy: newStatus ? currentUserName : null,
      completedAt: newStatus ? now : null
    } : t));

    try {
      await todosApi.update(task.id, {
        isCompleted: newStatus,
        completedBy: newStatus ? currentUserName : undefined
      });
    } catch (e) {
      console.warn('Error toggling task in db:', e);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await todosApi.delete(id);
    } catch (e) {
      console.warn('Error deleting task in db:', e);
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || t.category === categoryFilter;
    
    if (!matchSearch || !matchCategory) return false;

    if (activeTab === 'pending') return !t.isCompleted;
    if (activeTab === 'completed') return Boolean(t.isCompleted);
    if (activeTab === 'urgent') return t.priority === 'urgent';
    return true;
  });

  // Metrics
  const totalTasksCount = tasks.length;
  const pendingCount = tasks.filter(t => !t.isCompleted).length;
  const completedCount = tasks.filter(t => Boolean(t.isCompleted)).length;
  const urgentCount = tasks.filter(t => t.priority === 'urgent' && !t.isCompleted).length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  const tabs: TabItem[] = [
    { id: 'all', label: 'All Tasks', count: totalTasksCount },
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'urgent', label: 'Urgent', count: urgentCount }
  ];

  const categories = ['All', 'Compliance', 'Inventory', 'Sales', 'Finance', 'Logistics', 'General'];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-150">
      {/* Standard Page Header */}
      <PageHeader
        eyebrow="Administration & Operations"
        title="Operations Checklist"
        description="Daily showroom opening, warehouse audits, logistics follow-ups, and enterprise compliance tracking."
        actions={
          <Button
            variant="brand"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Operations Task
          </Button>
        }
      />

      {/* Broadcast Notification Alert Banner (Appears to all users when a task is added) */}
      {broadcastAlert && (
        <div className="p-4 rounded-xl border border-brand-ochre/40 bg-brand-ochre/15 text-stone-900 dark:text-[#F5F5F0] flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="w-7 h-7 rounded-lg bg-brand-ochre text-stone-950 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wide text-brand-ochreDeep dark:text-brand-ochre">
                New Task Broadcasted to All Users
              </h4>
              <Badge variant="brand" size="sm">Live Broadcast</Badge>
            </div>
            <p className="text-xs font-semibold text-content-primary mt-0.5">
              {broadcastAlert.title}
            </p>
            <p className="text-[11px] text-content-secondary mt-0.5 leading-relaxed">
              <strong>Overview:</strong> {broadcastAlert.overview}
            </p>
          </div>
        </div>
      )}

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface shadow-xs">
          <p className="text-[10.5px] font-semibold text-content-muted uppercase tracking-wider">Total Tasks</p>
          <p className="text-xl font-bold text-content-primary mt-0.5">{totalTasksCount}</p>
          <p className="text-[10px] text-content-muted mt-0.5">Operations ledger</p>
        </div>
        <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface shadow-xs">
          <p className="text-[10.5px] font-semibold text-content-muted uppercase tracking-wider">Pending Action</p>
          <p className="text-xl font-bold text-brand-ochreDeep dark:text-brand-ochre mt-0.5">{pendingCount}</p>
          <p className="text-[10px] text-content-muted mt-0.5">Active checkpoints</p>
        </div>
        <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface shadow-xs">
          <p className="text-[10.5px] font-semibold text-content-muted uppercase tracking-wider">Urgent Attention</p>
          <p className="text-xl font-bold text-status-danger mt-0.5">{urgentCount}</p>
          <p className="text-[10px] text-content-muted mt-0.5">High-priority items</p>
        </div>
        <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface shadow-xs">
          <p className="text-[10.5px] font-semibold text-content-muted uppercase tracking-wider">Completion Rate</p>
          <p className="text-xl font-bold text-status-success mt-0.5">{completionRate}%</p>
          <p className="text-[10px] text-content-muted mt-0.5">{completedCount} tasks verified</p>
        </div>
      </div>

      {/* Segmented Sub-Navigation Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-boundary-subtle shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <input
            type="text"
            placeholder="Search operations checklist by keyword or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-1.5 bg-surface-secondary border border-boundary-subtle rounded-lg text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand-ochre"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-secondary border border-boundary-subtle rounded-lg text-xs text-content-primary focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center border border-boundary-subtle rounded-xl bg-surface">
            <CheckCircle2 className="w-8 h-8 text-status-success mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-content-primary">No tasks found</h3>
            <p className="text-xs text-content-muted mt-0.5">All scheduled operations checkpoints in this category are clear.</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isDone = Boolean(t.isCompleted);
            const isUrgent = t.priority === 'urgent';
            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 bg-surface ${
                  isDone 
                    ? 'border-boundary-subtle opacity-75' 
                    : isUrgent 
                    ? 'border-status-dangerBorder shadow-xs' 
                    : 'border-boundary-subtle hover:border-boundary-strong'
                }`}
              >
                {/* Custom Themed Checkbox Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(t)}
                  aria-label={`Mark task ${t.title} as ${isDone ? 'incomplete' : 'complete'}`}
                  className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? 'bg-brand-ochre text-stone-950 shadow-xs'
                      : 'border border-boundary-strong bg-surface-secondary text-transparent hover:border-brand-ochre hover:text-brand-ochre/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant={
                        t.category === 'Compliance' ? 'brand' :
                        t.category === 'Inventory' ? 'sage' :
                        t.category === 'Finance' ? 'olive' :
                        t.category === 'Sales' ? 'sand' : 'neutral'
                      }
                      size="sm"
                    >
                      {t.category}
                    </Badge>

                    {isUrgent ? (
                      <Badge variant="danger" size="sm" dot>URGENT</Badge>
                    ) : t.priority === 'high' ? (
                      <Badge variant="warning" size="sm">HIGH</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">{t.priority.toUpperCase()}</Badge>
                    )}

                    {t.dueDate && (
                      <span className="text-[11px] text-content-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-content-muted" />
                        Due: {t.dueDate}
                      </span>
                    )}

                    <span className="text-[11px] text-content-muted font-mono">
                      ID: {t.id}
                    </span>
                  </div>

                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDone ? 'line-through text-content-muted' : 'text-content-primary'
                  }`}>
                    {t.title}
                  </h3>

                  {t.description && (
                    <p className={`text-xs mt-1 leading-relaxed ${
                      isDone ? 'text-content-muted' : 'text-content-secondary'
                    }`}>
                      {t.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-content-muted">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Created by: <strong className="font-semibold text-content-primary">{t.createdBy || 'Shahed Rahman Somoy'}</strong>
                    </span>
                    {isDone && t.completedBy && (
                      <span className="flex items-center gap-1 text-status-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified by: <strong className="font-semibold">{t.completedBy}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 h-7 w-7 text-content-muted hover:text-status-danger"
                    title="Delete Task"
                    aria-label={`Delete task: ${t.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Standard Modal: Add Operations Task */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Operations Task"
        subtitle="This task will be saved in SQLite and broadcasted to all users as a notification with an overview."
      >
        <form onSubmit={handleAddTask} className="space-y-3.5">
          <Input
            label="Task Title / Checkpoint"
            required
            placeholder="e.g. Verify Banani Vault GPU Serial Numbers against Inbound Manifest"
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Operational Category"
              value={taskCategory}
              onChange={e => setTaskCategory(e.target.value)}
            >
              <option value="Inventory">Inventory</option>
              <option value="Compliance">Compliance & Port Duties</option>
              <option value="Sales">Sales & Wholesale Orders</option>
              <option value="Finance">Finance & Banking</option>
              <option value="Logistics">Logistics & Courier</option>
              <option value="General">General Operations</option>
            </Select>

            <Select
              label="Priority Level"
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value as any)}
            >
              <option value="urgent">Urgent (Immediate broadcast alert)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>
          </div>

          <Input
            label="Due Date / Target Delivery"
            placeholder="e.g. 2026-10-21 or Today, 05:00 PM"
            value={taskDueDate}
            onChange={e => setTaskDueDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1 select-none">
              Detailed Overview & Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Provide exact overview of steps required, branch/vault location, and verification details..."
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              className="w-full rounded-lg bg-surface text-content-primary border border-boundary-strong focus:border-brand-ochre focus:ring-1 focus:ring-brand-ochre text-xs sm:text-sm px-3 py-2 placeholder:text-content-muted"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-boundary-subtle">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              type="submit"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add & Broadcast Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EssentialsPage;
