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

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      await userService.updateUser(id, req.tenant.id, { name, email });
      res.json({ message: "User updated successfully" });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id, req.tenant.id);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
