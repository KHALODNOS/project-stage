const express = require("express");
const router = express.Router();
const notificationController = require("../controller/NotificationController");
const { authenticate } = require("../middleware/middleware");

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.delete("/", notificationController.deleteAllNotifications);

module.exports = router;
