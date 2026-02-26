// Resolve tenant middleware
const pool = require("../config/database");

async function resolveTenant(req, res, next) {
  try {
    const slug =
      req.headers["x-tenant-slug"] ||
      req.hostname.split(".")[0];

    if (!slug) return res.status(400).json({ message: "Tenant required" });

    const [rows] = await pool.query(
      "SELECT * FROM tenants WHERE slug=? AND status='active'",
      [slug]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Tenant not found" });

    req.tenant = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = resolveTenant;