const { db } = require('../config/db');

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assigned_to, due_date, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title required' });
    const result = db.prepare('INSERT INTO tasks (title, description, project_id, assigned_to, created_by, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || '', projectId, assigned_to || null, req.user.id, due_date || null, priority || 'medium');
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = db.prepare(`
      SELECT t.*, u.name as assigned_name, c.name as creator_name FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.project_id = ? ORDER BY t.created_at DESC
    `).all(projectId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assigned_to, due_date, priority } = req.body;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    db.prepare(`UPDATE tasks SET
      title = ?, description = ?, status = ?, assigned_to = ?,
      due_date = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`).run(
      title || task.title, description || task.description,
      status || task.status, assigned_to || task.assigned_to,
      due_date || task.due_date, priority || task.priority, taskId
    );
    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT t.*, p.name as project_name FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = ? ORDER BY t.due_date ASC
    `).all(req.user.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
