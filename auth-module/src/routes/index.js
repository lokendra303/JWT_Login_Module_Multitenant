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

// Tenant updates user
router.put(
  "/tenant/users/:id",
  resolveTenant,
  authenticate,
  checkRole(["tenant"]),
  userController.updateUser
);

// Tenant deletes user
router.delete(
  "/tenant/users/:id",
  resolveTenant,
  authenticate,
  checkRole(["tenant"]),
  userController.deleteUser
);

// Tenant updates own profile
router.put(
  "/tenant/profile",
  authenticate,
  checkRole(["tenant"]),
  tenantController.updateProfile
);

// User login (no tenant middleware - finds tenant from email)
router.post("/login", authController.login);

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