const { v4: uuidv4 } = require("uuid");
const pool = require("../../config/database");
const passwordService = require("../security/password.service");
const tokenService = require("../security/token.service");

class TenantService {
  async register(name, email, mobile, password, slug) {
    const [existingSlug] = await pool.query(
      "SELECT * FROM tenants WHERE slug=?",
      [slug]
    );

    if (existingSlug.length) throw new Error("Tenant slug already exists");

    const [existingEmail] = await pool.query(
      "SELECT * FROM tenants WHERE email=?",
      [email]
    );

    if (existingEmail.length) throw new Error("Email already exists");

    const passwordHash = await passwordService.hash(password);
    const tenantId = uuidv4();

    await pool.query(
      "INSERT INTO tenants (id, name, email, mobile, password_hash, slug, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
      [tenantId, name, email, mobile, passwordHash, slug]
    );

    return { id: tenantId, name, email, mobile, slug };
  }

  async login(email, password) {
    const [tenants] = await pool.query(
      "SELECT * FROM tenants WHERE email=? AND status='active'",
      [email]
    );

    if (!tenants.length) throw new Error("Invalid credentials");

    const tenant = tenants[0];
    const valid = await passwordService.compare(password, tenant.password_hash);

    if (!valid) throw new Error("Invalid credentials");

    const accessToken = tokenService.generateAccessToken({
      sub: tenant.id,
      tid: tenant.id,
      userType: "tenant",
      email: tenant.email
    });

    const refreshToken = uuidv4();

    return {
      message: "Tenant login successful",
      accessToken,
      refreshToken,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        slug: tenant.slug
      }
    };
  }
}

module.exports = new TenantService();
