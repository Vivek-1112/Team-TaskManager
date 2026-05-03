import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error);
    api.get('/projects').then(r => setAllProjects(r.data)).catch(console.error);
  }, []);

  const cardStyle = { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '1rem' };
  const statStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };

  const statCard = (label, value, color) => (
    <div key={label} style={{ ...cardStyle, borderLeft: `4px solid ${color}`, marginBottom: 0 }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ color: '#64748b' }}>{label}</div>
    </div>
  );

  if (!data) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading dashboard...</div>;

  const statusMap = {};
  data.tasksByStatus.forEach(t => { statusMap[t.status] = parseInt(t.count); });

  const statusBadge = (status) => {
    const colors = { done: '#d1fae5', in_progress: '#ede9fe', todo: '#fef3c7', review: '#dbeafe' };
    return <span style={{ background: colors[status] || '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>{status.replace('_', ' ')}</span>;
  };

  if (user?.role === 'admin') {
    return (
      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #3b82f6)', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Admin Control Panel</h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.8 }}>Manage all projects, members and tasks</p>
        </div>

        <div style={statStyle}>
          {statCard('Total Projects', allProjects.length, '#3b82f6')}
          {statCard('Todo', statusMap['todo'] || 0, '#f59e0b')}
          {statCard('In Progress', statusMap['in_progress'] || 0, '#8b5cf6')}
          {statCard('Done', statusMap['done'] || 0, '#10b981')}
          {statCard('Overdue', data.overdueTasks.length, '#ef4444')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>All Projects</h3>
              <button onClick={() => nav('/projects')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Manage All</button>
            </div>
            {allProjects.length === 0 ? <p style={{ color: '#94a3b8' }}>No projects yet.</p> :
              allProjects.slice(0, 5).map(p => (
                <div key={p.id} onClick={() => nav(`/projects/${p.id}`)} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#1e293b' }}>{p.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Owner: {p.owner_name}</div>
                  </div>
                  <span style={{ background: '#dbeafe', color: '#3b82f6', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' }}>View</span>
                </div>
              ))}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', color: '#1e293b' }}>Overdue Tasks</h3>
            {data.overdueTasks.length === 0 ?
              <p style={{ color: '#94a3b8' }}>No overdue tasks!</p> :
              data.overdueTasks.map(t => (
                <div key={t.id} style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#dc2626' }}>{t.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.project_name} | Due: {new Date(t.due_date).toLocaleDateString()}</div>
                </div>
              ))}
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1e293b' }}>Recent Activity</h3>
          {data.recentTasks.length === 0 ? <p style={{ color: '#94a3b8' }}>No recent tasks.</p> :
            data.recentTasks.map(t => (
              <div key={t.id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{t.title}</strong> <span style={{ color: '#94a3b8' }}>in</span> {t.project_name}</span>
                {statusBadge(t.status)}
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #10b981)', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Welcome, {user?.name}!</h1>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.8 }}>Here is your personal task overview</p>
      </div>

      <div style={statStyle}>
        {statCard('My Projects', data.totalProjects, '#3b82f6')}
        {statCard('Todo', statusMap['todo'] || 0, '#f59e0b')}
        {statCard('In Progress', statusMap['in_progress'] || 0, '#8b5cf6')}
        {statCard('Done', statusMap['done'] || 0, '#10b981')}
        {statCard('Overdue', data.overdueTasks.length, '#ef4444')}
      </div>

      {data.overdueTasks.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Overdue Tasks - Action Required!</h3>
          {data.overdueTasks.map(t => (
            <div key={t.id} style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <strong>{t.title}</strong> <span style={{ color: '#94a3b8' }}>in</span> {t.project_name}
              <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>Due: {new Date(t.due_date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>My Recent Tasks</h3>
        {data.recentTasks.length === 0 ?
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <p>No tasks assigned yet.</p>
            <button onClick={() => nav('/projects')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Browse Projects</button>
          </div> :
          data.recentTasks.map(t => (
            <div key={t.id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>{t.title}</strong> <span style={{ color: '#94a3b8' }}>in</span> {t.project_name}</span>
              {statusBadge(t.status)}
            </div>
          ))}
      </div>
    </div>
  );
};
export default Dashboard;
