import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchJobs, updateJob, createJob } from '../hooks/useJobsApi';
import AppDetailDrawer from '../components/AppDetailDrawer';
import JobModal from '../components/JobModal';
import CSVImportModal from '../components/CSVImportModal';

// ─── Stage columns definition ─────────────────────────────────────────────────
const STAGES = [
  { id: 'Saved',      label: 'Saved',      color: '#94a3b8' },
  { id: 'Applied',    label: 'Applied',     color: '#3b82f6' },
  { id: 'OA',         label: 'Online Assessment', color: '#06b6d4' },
  { id: 'Interview',  label: 'Interview',   color: '#8b5cf6' },
  { id: 'Offer',      label: 'Offer 🎉',    color: '#10b981' },
  { id: 'Rejected',   label: 'Rejected',    color: '#ef4444' },
  { id: 'Withdrawn',  label: 'Withdrawn',   color: '#f59e0b' },
];

const Kanban = () => {
  const [columns, setColumns]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [drawerJob, setDrawerJob]   = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSV, setShowCSV]       = useState(false);
  const [search, setSearch]         = useState('');

  // ─── Build columns from flat jobs array ───────────────────────────────────
  const buildColumns = useCallback((jobs) => {
    const cols = {};
    STAGES.forEach(s => { cols[s.id] = []; });
    jobs.forEach(job => {
      if (cols[job.status]) cols[job.status].push(job);
      else cols['Saved'].push(job);
    });
    setColumns(cols);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobs({ sortBy: 'createdAt', order: 'desc' });
      buildColumns(data.jobs);
    } catch { toast.error('Failed to load board'); }
    finally  { setLoading(false); }
  }, [buildColumns]);

  useEffect(() => { load(); }, [load]);

  // ─── Filter cards by search ───────────────────────────────────────────────
  const filterCards = (cards) => {
    if (!search.trim()) return cards;
    const q = search.toLowerCase();
    return cards.filter(j =>
      j.companyName?.toLowerCase().includes(q) ||
      j.roleTitle?.toLowerCase().includes(q)
    );
  };

  // ─── Drag end handler ─────────────────────────────────────────────────────
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const srcCol  = source.droppableId;
    const dstCol  = destination.droppableId;

    // Optimistic update
    const srcCards = [...(columns[srcCol] || [])];
    const dstCards = srcCol === dstCol ? srcCards : [...(columns[dstCol] || [])];
    const [moved]  = srcCards.splice(source.index, 1);
    moved.status   = dstCol;
    dstCards.splice(destination.index, 0, moved);

    if (srcCol === dstCol) {
      setColumns(prev => ({ ...prev, [srcCol]: dstCards }));
    } else {
      setColumns(prev => ({ ...prev, [srcCol]: srcCards, [dstCol]: dstCards }));
    }

    // Persist to backend
    try {
      await updateJob(draggableId, { status: dstCol });
      toast.success(`Moved to ${dstCol}`);
    } catch {
      toast.error('Failed to update status');
      load(); // revert on failure
    }
  };

  // ─── Add application from modal ───────────────────────────────────────────
  const handleAdd = async (formData) => {
    try {
      await createJob(formData);
      toast.success('Application added!');
      setShowAddModal(false);
      load();
    } catch { toast.error('Failed to add application'); }
  };

  // ─── Update job in drawer ─────────────────────────────────────────────────
  const handleDrawerUpdate = (updatedJob) => {
    setDrawerJob(updatedJob);
    load();
  };

  const priorityDot = (p) => {
    const c = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
    return <span style={{ width: 7, height: 7, borderRadius: '50%', background: c[p] || '#94a3b8', display: 'inline-block', flexShrink: 0 }} title={`${p} priority`} />;
  };

  const totalJobs = Object.values(columns).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        background: 'var(--bg-secondary)',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Kanban Board</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalJobs} applications · drag cards to update status</p>
        </div>
        <div style={{ flex: 1 }} />
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input
            type="text" className="search-input"
            style={{ paddingLeft: 32, width: 200 }}
            placeholder="Search cards..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowCSV(true)}>
          📥 Import CSV
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          + Add Application
        </button>
      </div>

      {/* Board */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading board...
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{
            display: 'flex', gap: 0, overflowX: 'auto', flex: 1,
            padding: '16px', gap: 12,
          }}>
            {STAGES.map(stage => {
              const cards = filterCards(columns[stage.id] || []);
              const total = (columns[stage.id] || []).length;

              return (
                <div key={stage.id} style={{
                  flexShrink: 0, width: 240,
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, overflow: 'hidden',
                  maxHeight: '100%',
                }}>
                  {/* Column header */}
                  <div style={{
                    padding: '12px 14px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: `${stage.color}12`,
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, flex: 1, color: 'var(--text-primary)' }}>{stage.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                      background: `${stage.color}22`, color: stage.color,
                    }}>{total}</span>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          flex: 1, overflowY: 'auto', padding: '10px 10px',
                          minHeight: 80,
                          background: snapshot.isDraggingOver ? `${stage.color}08` : 'transparent',
                          transition: 'background 0.2s',
                          display: 'flex', flexDirection: 'column', gap: 8,
                        }}
                      >
                        {cards.length === 0 && !snapshot.isDraggingOver && (
                          <div style={{
                            textAlign: 'center', padding: '20px 8px',
                            color: 'var(--text-muted)', fontSize: 12,
                            border: '1px dashed var(--border)', borderRadius: 8,
                          }}>
                            {search ? 'No matches' : 'Drop here'}
                          </div>
                        )}

                        {cards.map((job, index) => (
                          <Draggable key={job._id} draggableId={job._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setDrawerJob(job)}
                                style={{
                                  padding: '10px 12px',
                                  background: snapshot.isDragging ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                                  border: `1px solid ${snapshot.isDragging ? stage.color : 'var(--border)'}`,
                                  borderRadius: 10,
                                  cursor: 'grab',
                                  boxShadow: snapshot.isDragging ? `0 8px 24px rgba(0,0,0,0.4)` : 'none',
                                  transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                  transition: 'box-shadow 0.2s, border-color 0.2s',
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4 }}>
                                  {priorityDot(job.priority)}
                                  <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>{job.roleTitle}</span>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                                  {job.companyName}
                                </p>
                                {job.location && (
                                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                                    📍 {job.location}
                                  </p>
                                )}
                                {job.interviewDate && (
                                  <p style={{ fontSize: 11, color: '#8b5cf6', margin: '4px 0 0' }}>
                                    🗓 {new Date(job.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </p>
                                )}
                                {job.salaryNote && (
                                  <p style={{ fontSize: 11, color: '#10b981', margin: '4px 0 0' }}>
                                    💰 {job.salaryNote}
                                  </p>
                                )}
                                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{job.source || ''}</span>
                                  <span style={{ color: 'var(--accent)', fontSize: 10 }}>click for details →</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Application Detail Drawer */}
      {drawerJob && (
        <AppDetailDrawer
          job={drawerJob}
          onClose={() => setDrawerJob(null)}
          onUpdate={handleDrawerUpdate}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <JobModal
          job={null}
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
        />
      )}

      {/* CSV Import modal */}
      {showCSV && (
        <CSVImportModal
          onClose={() => setShowCSV(false)}
          onImported={() => { setShowCSV(false); load(); }}
        />
      )}
    </div>
  );
};

export default Kanban;
