const tenantService = require("../../services/tenant/tenant.service");

class TenantController {
  async register(req, res, next) {
    try {
      const { name, email, mobile, password, slug } = req.body;
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
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TenantController();
