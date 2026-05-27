import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskPanel = ({ jobId, companyName, roleTitle }) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle]     = useState('');
  const [dueAt, setDueAt]     = useState('');
  const [adding, setAdding]   = useState(false);

  const load = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${jobId}/tasks`);
      setTasks(data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { if (jobId) load(); }, [jobId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Task title required');
    setAdding(true);
    try {
      await axios.post(`/api/jobs/${jobId}/tasks`, { title, dueAt });
      toast.success('Task added' + (dueAt ? ' — reminder scheduled!' : ''));
      setTitle(''); setDueAt('');
      load();
    } catch { toast.error('Failed to add task'); }
    finally { setAdding(false); }
  };

  const handleToggle = async (taskId) => {
    try {
      const { data } = await axios.patch(`/api/jobs/${jobId}/tasks/${taskId}/toggle`);
      setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    } catch { toast.error('Failed to update task'); }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/jobs/${jobId}/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const formatDue = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const now  = new Date();
    const overdue = date < now;
    return { text: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), overdue };
  };

  const pending = tasks.filter(t => !t.done);
  const done    = tasks.filter(t => t.done);

  return (
    <div>
      {/* Add task form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text" className="form-input" placeholder="New task..."
          value={title} onChange={e => setTitle(e.target.value)}
          style={{ flex: 2, minWidth: 140 }}
        />
        <input
          type="datetime-local" className="form-input"
          value={dueAt} onChange={e => setDueAt(e.target.value)}
          style={{ flex: 1, minWidth: 140 }}
          title="Set due date/time — a reminder fires 30 min before"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>
          {adding ? '...' : '+ Add'}
        </button>
      </form>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, marginTop: -8 }}>
        ⏰ Set a due time to get a reminder 30 minutes before
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tasks yet. Add your first one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Pending tasks */}
          {pending.map(task => {
            const due = formatDue(task.dueAt);
            return (
              <div key={task._id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: 'var(--bg-secondary)',
                borderRadius: 8, border: '1px solid var(--border)',
              }}>
                <button
                  onClick={() => handleToggle(task._id)}
                  style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: '2px solid var(--accent)', background: 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  title="Mark done"
                />
                <span style={{ flex: 1, fontSize: 14 }}>{task.title}</span>
                {due && (
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: due.overdue ? 'var(--danger)' : 'var(--text-muted)',
                    background: due.overdue ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                    padding: '2px 8px', borderRadius: 10,
                  }}>
                    {due.overdue ? '⚠ ' : '📅 '}{due.text}
                  </span>
                )}
                <button onClick={() => handleDelete(task._id)} className="btn btn-danger btn-sm" style={{ padding: '3px 8px' }}>✕</button>
              </div>
            );
          })}

          {/* Done tasks */}
          {done.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Completed ({done.length})
              </p>
              {done.map(task => (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', background: 'transparent',
                  borderRadius: 8, opacity: 0.5,
                }}>
                  <button
                    onClick={() => handleToggle(task._id)}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: '2px solid var(--success)', background: 'var(--success)',
                      cursor: 'pointer',
                    }}
                    title="Mark pending"
                  />
                  <span style={{ flex: 1, fontSize: 14, textDecoration: 'line-through' }}>{task.title}</span>
                  <button onClick={() => handleDelete(task._id)} className="btn btn-danger btn-sm" style={{ padding: '3px 8px' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPanel;
