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

    if (existingSlug.length) throw new Error("Company name already taken, please choose another");

    const [existingEmail] = await pool.query(
      "SELECT * FROM tenants WHERE email=?",
      [email]
    );

    if (existingEmail.length) throw new Error("Email already registered");

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

    if (!tenants.length) throw new Error("Invalid email or password");

    const tenant = tenants[0];
    const valid = await passwordService.compare(password, tenant.password_hash);

    if (!valid) throw new Error("Invalid email or password");

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

  async updateProfile(tenantId, data) {
    const { name, email, mobile, password } = data;
    
    if (email) {
      const [existing] = await pool.query(
        "SELECT * FROM tenants WHERE email = ? AND id != ?",
        [email, tenantId]
      );
      if (existing.length) throw new Error("Email already registered");
    }

    const updates = [];
    const values = [];
    
    if (name) { 
      updates.push("name = ?"); 
      values.push(name);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      updates.push("slug = ?");
      values.push(slug);
    }
    if (email) { updates.push("email = ?"); values.push(email); }
    if (mobile) { updates.push("mobile = ?"); values.push(mobile); }
    if (password) {
      const passwordHash = await passwordService.hash(password);
      updates.push("password_hash = ?");
      values.push(passwordHash);
    }
    
    if (updates.length === 0) throw new Error("No fields to update");
    
    values.push(tenantId);
    
    await pool.query(
      `UPDATE tenants SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }
}

module.exports = new TenantService();
