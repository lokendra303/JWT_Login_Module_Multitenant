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
}

module.exports = new UserRepository();