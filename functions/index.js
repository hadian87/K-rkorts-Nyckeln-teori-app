/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const cors = require("cors")({origin: true}); // استيراد cors للسماح بالطلبات من جميع الأصول

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Function to test the deployment
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  cors(request, response, () => {
    response.send("Hello from Firebase!");
  });
});

// Function to delete a user
exports.deleteUser = onRequest((req, res) => {
  // استخدام cors للسماح بالطلبات من أصول مختلفة
  cors(req, res, async () => {
    // التحقق من طريقة الطلب لضمان أنها POST فقط
    if (req.method !== "POST") {
      return res.status(405).send({error: "Only POST requests are allowed"});
    }

    const {uid} = req.body;

    // التحقق من وجود uid في الطلب
    if (!uid) {
      return res.status(400).send({error: "User ID (uid) is required"});
    }

    try {
      // حذف المستخدم من Firebase Authentication
      await admin.auth().deleteUser(uid);
      logger.info(`User with uid ${uid} deleted successfully`);
      res.status(200).send({message: "User deleted successfully"});
    } catch (error) {
      logger.error("Failed to delete user: ", error);
      res.status(500).send({error: error.message});
    }
  });
});
