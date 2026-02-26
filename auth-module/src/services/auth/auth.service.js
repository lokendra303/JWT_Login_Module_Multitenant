// Auth service
const { v4: uuidv4 } = require("uuid");
const userRepository = require("../../repositories/user.repository");
const passwordService = require("../security/password.service");
const tokenService = require("../security/token.service");
const pool = require("../../config/database");

class AuthService {
  async register(email, password, name, tenant) {
    const existing = await userRepository.findByEmail(email, tenant.id);
    if (existing) throw new Error("Email already exists");

    const passwordHash = await passwordService.hash(password);
    const userId = uuidv4();

    await pool.query(
      "INSERT INTO users (id, tenant_id, email, password_hash, name) VALUES (?, ?, ?, ?, ?)",
      [userId, tenant.id, email, passwordHash, name]
    );

    return { id: userId, email, name };
  }

  async login(email, password, tenant) {
    const user = await userRepository.findByEmail(email, tenant.id);

    if (!user) throw new Error("Invalid credentials");

    const valid = await passwordService.compare(
      password,
      user.password_hash
    );

    if (!valid) throw new Error("Invalid credentials");

    const accessToken = tokenService.generateAccessToken({
      sub: user.id,
      tid: tenant.id,
      role: user.role_id,
      tokenVersion: user.token_version
    });

    const refreshToken = uuidv4();

    await pool.query(
      "INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [uuidv4(), user.id, refreshToken]
    );

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();