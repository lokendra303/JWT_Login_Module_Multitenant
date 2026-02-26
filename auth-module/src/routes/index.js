// Routes index
const express = require("express");
const tenantController = require("../controllers/tenant/tenant.controller");
const authController = require("../controllers/auth/auth.controller");
const userController = require("../controllers/user/user.controller");
const resolveTenant = require("../middleware/resolveTenant.middleware");
const authenticate = require("../middleware/authenticate.middleware");
const checkRole = require("../middleware/checkRole.middleware");

const router = express.Router();

// Tenant registration (no middleware needed)
router.post("/tenant/register", tenantController.register);

// Tenant login (no middleware needed)
router.post("/tenant/login", tenantController.login);

// Tenant creates user
router.post(
  "/tenant/users",
  resolveTenant,
  authenticate,
  checkRole(["tenant"]),
  authController.register
);

// Tenant gets all users
router.get(
  "/tenant/users",
  resolveTenant,
  authenticate,
  checkRole(["tenant"]),
  userController.getAllUsers
);

// User login
router.post(
  "/login",
  resolveTenant,
  authController.login
);

// Protected route example
router.get(
  "/protected",
  resolveTenant,
  authenticate,
  (req, res) => {
    res.json({
      message: "Protected data accessed",
      user: req.user,
      tenant: req.tenant.name
    });
  }
);

module.exports = router;