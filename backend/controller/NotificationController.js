const Notification = require("../models/notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { toggleRole: req.user.role },
            { targetUser: req.user._id }
          ]
        },
        { sender: { $ne: req.user._id } }
      ]
    }).sort({ createdAt: -1 });

    console.log(
      `Fetched ${notifications.length} notifications for role: ${req.user.role}`,
    );

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      $and: [
        {
          $or: [
            { toggleRole: req.user.role },
            { targetUser: req.user._id }
          ]
        },
        { sender: { $ne: req.user._id } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} notifications for user ${req.user._id}`);
    res.json({ message: "Notifications deleted successfully", count: result.deletedCount });
  } catch (error) {
    console.error("Error deleting notifications:", error.message);
    res.status(500).json({ message: error.message });
  }
};
