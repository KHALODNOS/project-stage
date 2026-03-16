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
