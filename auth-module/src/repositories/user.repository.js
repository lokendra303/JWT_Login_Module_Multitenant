const pool = require("../config/database");

class UserRepository {
  async findByEmail(email, tenantId) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email=? AND tenant_id=? AND status='active'",
      [email, tenantId]
    );
    return rows[0];
  }

  async findById(id, tenantId) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id=? AND tenant_id=?",
      [id, tenantId]
    );
    return rows[0];
  }

  async getAllByTenant(tenantId) {
    const [rows] = await pool.query(
      "SELECT id, name, email, COALESCE(role_id, 'user') as role, status, created_at FROM users WHERE tenant_id=?",
      [tenantId]
    );
    return rows;
  }
}

module.exports = new UserRepository();