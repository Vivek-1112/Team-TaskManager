const { db } = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM project_members WHERE user_id = ?').get(userId).count;
    const tasksByStatus = db.prepare('SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status').all(userId);
    const overdueTasks = db.prepare(`
      SELECT t.*, p.name as project_name FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = ? AND t.due_date < DATE('now') AND t.status != 'done'
    `).all(userId);
    const recentTasks = db.prepare(`
      SELECT t.*, p.name as project_name FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = ? ORDER BY t.updated_at DESC LIMIT 5
    `).all(userId);
    res.json({ totalProjects, tasksByStatus, overdueTasks, recentTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
