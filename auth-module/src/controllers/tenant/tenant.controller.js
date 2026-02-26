const tenantService = require("../../services/tenant/tenant.service");

class TenantController {
  async register(req, res, next) {
    try {
      const { name, email, mobile, password } = req.body;
      
      if (!name || !email || !mobile || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const tenant = await tenantService.register(name, email, mobile, password, slug);
      res.status(201).json({ message: "Tenant registered successfully", tenant });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await tenantService.login(email, password);
      res.json({ message: result.message, token: result.accessToken, tenant: result.tenant });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const tenantId = req.user.sub;
      const { name, email, mobile, password } = req.body;
      await tenantService.updateProfile(tenantId, { name, email, mobile, password });
      res.json({ message: "Profile updated successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TenantController();
