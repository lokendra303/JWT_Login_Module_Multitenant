const userRepository = require("../../repositories/user.repository");
const pool = require("../../config/database");

class UserService {
  async getAllUsers(tenantId) {
    return await userRepository.getAllByTenant(tenantId);
  }

  async updateUser(userId, tenantId, data) {
    const { name, email, mobile } = data;
    
    if (email) {
      const [existing] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (existing.length) throw new Error("Email already registered");
    }

    const updates = [];
    const values = [];
    
    if (name) { updates.push("name = ?"); values.push(name); }
    if (email) { updates.push("email = ?"); values.push(email); }
    
    if (updates.length === 0) throw new Error("No fields to update");
    
    values.push(userId, tenantId);
    
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`,
      values
    );
  }

  async deleteUser(userId, tenantId) {
    await pool.query(
      "DELETE FROM users WHERE id = ? AND tenant_id = ?",
      [userId, tenantId]
    );
  }
}

module.exports = new UserService();
