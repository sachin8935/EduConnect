const Razorpay = require("razorpay");
const teacherM = require("../modals/teacher");
const crypto = require("crypto");
const Payment = require("../modals/payment");
const userDM = require("../modals/userData");
const teacherDM = require("../modals/teacherData");
require("dotenv").config();
// Instantiating Razorpay
var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

exports.studentHome = async (req, res) => {
  console.log(req.user);
  const teacher = await teacherM.find().select(["-password", "-_id"]);
  return res.status(200).json({ status: "success", data: teacher });
  console.log(teacher);
};

// Information related to payment
exports.studentPayment = async (req, res) => {
  try {
    // console.log(req.params, req.body);
    const teacher = await teacherM.findOne({ Tid: req.body.Tid });
    console.log(teacher.fees * 100);

    var options = {
      amount: teacher.fees * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_1",
    };

    instance.orders.create(options, function (err, order) {
      //   console.log(order);
      res.status(200).json({ orderID: order });
    });
  } catch (error) {
    res.status(400).json({ status: "failed", message: "Order not created" });
  }
};

// Verify that payment done is legit or not
exports.paymentVerify = async (req, res) => {
  try {
    const data = req.body;

    const shasum = crypto.createHmac("sha256", "slZdnySnaQh9hYfoGCJXawcl");
    shasum.update(`${data["orderID"]}|${data["razorpay_payment_id"]}`);
    const digest = shasum.digest("hex");

    // console.log(digest !== data["razorpay_signature"]);
    if (digest !== data["razorpay_signature"])
      return res.status(400).json({ msg: "Transaction not legit!" });

    // THE PAYMENT IS LEGIT & VERIFIED

    // Update student's paid field here...
    const teacher = await teacherM.find({ Tid: data["Tid"] });
    // console.log(req.params);
    if (teacher) {
      const addPay = await Payment.create({
        orderID: data["razorpay_order_id"],
        paymentID: data["razorpay_payment_id"],
        teacherID: data["Tid"],
      });
    } else {
      return res
        .status(400)
        .json({ status: "failed", message: "Teacher not found" });
    }

    // Find teacher and add student ID and data to his record
    const teacherD = await teacherDM.find({ Tid: data["Tid"] });
    if (teacherD.length == 1) {
      const teacherData = await teacherDM.findOneAndUpdate(
        { Tid: req.params.id },
        {
          $push: { student: [{ Uid: req.params.id }] },
        }
      );
    } else {
      const teacherData = await teacherDM.create({
        Tid: data["Tid"],
        student: [{ Uid: req.params.id }],
      });
    }

    // Find student and add teacher ID to his data
    const student = await userDM.find({ userID: req.params.id });
    console.log(student.length);
    if (student.length == 1) {
      const studentData = await userDM.findOneAndUpdate(
        { userID: req.params.id },
        {
          $push: { teacher: [{ tid: data["Tid"] }] },
        }
      );
    } else {
      const studentData = await userDM.create({
        userID: req.params.id,
        teacher: [{ tid: data["Tid"] }],
      });
    }

    res.status(200).json({
      status: "success",
      orderId: data["razorpay_order_id"],
      paymentId: data["razorpay_payment_id"],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: "Something went wrong" });
  }
};
