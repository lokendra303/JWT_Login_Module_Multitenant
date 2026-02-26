// Routes index
const express = require("express");
const tenantController = require("../controllers/tenant/tenant.controller");
const authController = require("../controllers/auth/auth.controller");
const resolveTenant = require("../middleware/resolveTenant.middleware");
const authenticate = require("../middleware/authenticate.middleware");

const router = express.Router();

// Tenant registration (no middleware needed)
router.post("/tenant/register", tenantController.register);

// User registration
router.post(
  "/register",
  resolveTenant,
  authController.register
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