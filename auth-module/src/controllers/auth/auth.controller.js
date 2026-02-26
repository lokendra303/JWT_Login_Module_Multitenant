// Auth controller
const authService = require("../../services/auth/auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, mobile, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
      }

      const user = await authService.register(
        email,
        password,
        name,
        req.tenant
      );

      res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req.tenant);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();