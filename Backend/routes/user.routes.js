const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user.contoller");
const authUserMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],

  userController.registerUser
);


router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.loginUser
);


router.get('/profile', authUserMiddleware.authUser, userController.getUserProfile);

router.get('/logout', authUserMiddleware.authUser, userController.logoutUser);

router.get('/rides', authUserMiddleware.authUser, userController.getRideHistory);

router.post(
  "/captain-near-user",
  [
    body("ltd").isFloat().withMessage("Invalid latitude"),
    body("lng").isFloat().withMessage("Invalid longitude")
  ],
  userController.getAllCaptainsInRadius
);


module.exports = router;
