const userService = require("../../services/user/user.service");

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers(req.tenant.id);
      res.json({ users, count: users.length });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
