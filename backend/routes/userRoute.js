const express = require("express");
const AuthControl = require("../controller/AuthController");
const loginControl = require("../controller/logInControl");
const studentClass = require("../controller/studentClass");
const studentHome = require("../controller/studentHome");
const protect = require("../controller/protect");

const router = express.Router();

router.route("/signUp").post(AuthControl.createUser);
router.route("/logIn").post(loginControl.logInUser);

router.use(protect.protect); // For authroizing user at every route

router.route("/:id").get(studentHome.studentHome);
router.route("/:id/payment").post(studentHome.studentPayment); // For teachers payment to get access
router.route("/:id/payment/verify").post(studentHome.paymentVerify); // For teachers payment to verify
router.route("/:id/class").get(studentClass.assignmentRetrive);

router
  .route("/:id/class/:tid")
  .get(studentClass.teacherAssignment)
  .post(studentClass.studentAssignment);
module.exports = router;
