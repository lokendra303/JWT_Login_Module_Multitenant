const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwt");

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessExpiry
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, jwtConfig.secret);
  }
}

module.exports = new TokenService();