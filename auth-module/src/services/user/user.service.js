const userRepository = require("../../repositories/user.repository");

class UserService {
  async getAllUsers(tenantId) {
    return await userRepository.getAllByTenant(tenantId);
  }
}

module.exports = new UserService();
