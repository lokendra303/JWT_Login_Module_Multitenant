// Auth controller
const authService = require("../../services/auth/auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

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

      const tokens = await authService.login(
        email,
        password,
        req.tenant
      );

      res.json(tokens);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();