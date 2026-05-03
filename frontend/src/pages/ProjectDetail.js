import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY = ['low', 'medium', 'high'];

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [showTask, setShowTask] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const loadProject = () => api.get(`/projects/${id}`).then(r => setProject(r.data));
  const loadTasks = () => api.get(`/projects/${id}/tasks`).then(r => setTasks(r.data));
  const loadUsers = () => api.get('/auth/users').then(r => setAllUsers(r.data));

  useEffect(() => { loadProject(); loadTasks(); loadUsers(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isAdmin = user?.role === 'admin' || project?.owner_id === user?.id;

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const createTask = async (e) => {
    e.preventDefault();
    await api.post(`/projects/${id}/tasks`, form);
    setForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
    setShowTask(false); loadTasks();
    showMsg('Task created successfully!');
  };

  const updateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status }); loadTasks();
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) { await api.delete(`/tasks/${taskId}`); loadTasks(); }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) { showMsg('Please select a user', 'error'); return; }
    try {
      const selectedUser = allUsers.find(u => u.id === parseInt(selectedUserId));
      await api.post(`/projects/${id}/members`, { email: selectedUser.email, role: memberRole });
      setSelectedUserId(''); setShowMember(false); loadProject();
      showMsg(`${selectedUser.name} added successfully!`);
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error adding member', 'error');
    }
  };

  const removeMember = async (userId) => {
    if (window.confirm('Remove this member from project?')) {
      await api.delete(`/projects/${id}/members/${userId}`);
      loadProject(); showMsg('Member removed');
    }
  };

  const inputStyle = { padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem' };
  const cardStyle = { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '1rem' };
  const statusColor = { todo: '#fef3c7', in_progress: '#ede9fe', review: '#dbeafe', done: '#d1fae5' };
  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  if (!project) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;

  const currentMemberIds = project.members?.map(m => m.id) || [];
  const availableUsers = allUsers.filter(u => !currentMemberIds.includes(u.id));

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ background: isAdmin ? 'linear-gradient(135deg, #1e293b, #3b82f6)' : 'linear-gradient(135deg, #0f172a, #10b981)', padding: '1.5rem 2rem', borderRadius: '12px', color: 'white', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>{project.description}</p>
        </div>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
          {isAdmin ? 'Admin View' : 'Member View'}
        </span>
      </div>

      {msg && (
        <div style={{ background: msgType === 'success' ? '#d1fae5' : '#fee2e2', color: msgType === 'success' ? '#065f46' : '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {msg}
        </div>
      )}

      {!isAdmin && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#0369a1' }}>
          You can update the status of tasks assigned to you. Only admins can create or delete tasks.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#1e293b', margin: 0 }}>Tasks ({tasks.length})</h2>
            {isAdmin && (
              <button onClick={() => setShowTask(!showTask)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                {showTask ? 'Cancel' : '+ Add Task'}
              </button>
            )}
          </div>

          {isAdmin && showTask && (
            <div style={{ ...cardStyle, border: '2px solid #3b82f6' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#3b82f6' }}>Create New Task</h4>
              <form onSubmit={createTask}>
                <input style={inputStyle} placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <textarea style={{ ...inputStyle, height: '60px' }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Assign To Member</label>
                <select style={inputStyle} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Priority</label>
                <select style={inputStyle} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITY.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Due Date</label>
                <input style={inputStyle} type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Create Task</button>
              </form>
            </div>
          )}

          {tasks.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8' }}>
              <p>{isAdmin ? 'No tasks yet. Create the first task!' : 'No tasks assigned yet. Admin will assign tasks to you.'}</p>
            </div>
          ) : tasks.map(t => {
            const isMyTask = t.assigned_to === user?.id;
            return (
              <div key={t.id} style={{ ...cardStyle, borderLeft: `4px solid ${priorityColor[t.priority] || '#94a3b8'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#1e293b' }}>{t.title}</strong>
                      <span style={{ background: priorityColor[t.priority] + '22', color: priorityColor[t.priority], padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{t.priority}</span>
                      {isMyTask && <span style={{ background: '#dbeafe', color: '#3b82f6', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' }}>Yours</span>}
                    </div>
                    {t.description && <p style={{ color: '#64748b', margin: '0.25rem 0', fontSize: '0.9rem' }}>{t.description}</p>}
                    <small style={{ color: '#94a3b8' }}>
                      {t.assigned_name ? `Assigned: ${t.assigned_name}` : 'Unassigned'}
                      {t.due_date ? ` | Due: ${new Date(t.due_date).toLocaleDateString()}` : ''}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {(isAdmin || isMyTask) ? (
                      <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                        style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: statusColor[t.status] || '#f8fafc', cursor: 'pointer' }}>
                        {STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    ) : (
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: statusColor[t.status] || '#f8fafc', fontSize: '0.85rem' }}>{t.status.replace('_', ' ')}</span>
                    )}
                    {isAdmin && (
                      <button onClick={() => deleteTask(t.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Team ({project.members?.length || 0})</h3>
              {isAdmin && (
                <button onClick={() => setShowMember(!showMember)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {showMember ? 'Cancel' : '+ Add'}
                </button>
              )}
            </div>

            {isAdmin && showMember && (
              <form onSubmit={addMember} style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Select Registered User</label>
                <select style={inputStyle} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                  <option value="">-- Select a user --</option>
                  {availableUsers.length === 0
                    ? <option disabled>No more users to add</option>
                    : availableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email}) — {u.role}</option>
                    ))
                  }
                </select>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Assign Role in Project</label>
                <select style={inputStyle} value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Add to Project</button>
              </form>
            )}

            {project.members?.map(m => (
              <div key={m.id} style={{ padding: '0.75rem', background: m.id === user?.id ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', border: m.id === user?.id ? '1px solid #86efac' : '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{m.name} {m.id === user?.id ? '(You)' : ''}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ background: m.role === 'admin' ? '#dbeafe' : '#f1f5f9', color: m.role === 'admin' ? '#3b82f6' : '#64748b', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' }}>{m.role}</span>
                    {isAdmin && m.id !== user?.id && (
                      <button onClick={() => removeMember(m.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div style={{ ...cardStyle, background: '#fffbeb', border: '1px solid #fcd34d' }}>
              <h4 style={{ margin: '0 0 0.75rem', color: '#92400e' }}>Admin Controls</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#78350f', lineHeight: '1.8' }}>
                <li>Create and delete tasks</li>
                <li>Assign tasks to members</li>
                <li>Add or remove members</li>
                <li>Set priorities and deadlines</li>
                <li>Update any task status</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProjectDetail;


