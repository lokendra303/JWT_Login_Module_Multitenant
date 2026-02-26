// Auth service
const { v4: uuidv4 } = require("uuid");
const userRepository = require("../../repositories/user.repository");
const passwordService = require("../security/password.service");
const tokenService = require("../security/token.service");
const pool = require("../../config/database");

class AuthService {
  async register(email, password, name, tenant) {
    // Check if email exists globally
    const [globalCheck] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (globalCheck.length) throw new Error("Email already registered");

    const passwordHash = await passwordService.hash(password);
    const userId = uuidv4();

    await pool.query(
      "INSERT INTO users (id, tenant_id, email, password_hash, name) VALUES (?, ?, ?, ?, ?)",
      [userId, tenant.id, email, passwordHash, name]
    );

    return { id: userId, email, name };
  }

  async login(email, password, tenant = null) {
    let user;
    let tenantData;

    if (tenant) {
      // Login with tenant context (from middleware)
      user = await userRepository.findByEmail(email, tenant.id);
      tenantData = tenant;
    } else {
      // Find user across all tenants by email
      const [users] = await pool.query(
        "SELECT u.*, t.id as tenant_id, t.slug as tenant_slug, t.name as tenant_name FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = ? AND u.status = 'active' LIMIT 1",
        [email]
      );
      
      if (!users.length) throw new Error("Invalid email or password");
      
      user = users[0];
      tenantData = { id: user.tenant_id, slug: user.tenant_slug, name: user.tenant_name };
    }

    if (!user) throw new Error("Invalid email or password");

    const valid = await passwordService.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid email or password");

    const accessToken = tokenService.generateAccessToken({
      sub: user.id,
      tid: tenantData.id,
      role: user.role_id,
      userType: "user",
      tokenVersion: user.token_version
    });

    const refreshToken = uuidv4();

    await pool.query(
      "INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [uuidv4(), user.id, refreshToken]
    );

    return {
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role_id,
        tenant_id: tenantData.id,
        tenant_name: tenantData.name
      }
    };
  }
}

module.exports = new AuthService();