
// Route لإنشاء إشعار


const Notification = require('../models/Notification');

// إنشاء إشعار جديد
exports.createNotification = async (req, res) => {
  try {
    const { destinataire, titre, message, type, employe, details } = req.body;

    if (!destinataire || !titre || !message || !type) {
      return res.status(400).json({
        message: 'جميع الحقول مطلوبة: destinataire, titre, message, type',
      });
    }

    const notification = new Notification({
      destinataire,
      titre,
      message,
      type,
      employe,
      details,
    });

    await notification.save();

    res.status(201).json({
      message: 'تم إنشاء الإشعار بنجاح',
      notification,
    });
  } catch (error) {
    console.error('خطأ في إنشاء الإشعار:', error);
    res.status(500).json({
      message: 'خطأ في إنشاء الإشعار',
      error: error.message,
    });
  }
};

// جلب الإشعارات
exports.getNotifications = async (req, res) => {
  try {
    const { destinataire } = req.query;

    if (!['admin', 'medecin', 'employe'].includes(destinataire)) {
      return res.status(400).json({ message: 'الدور غير صالح' });
    }

    const notifications = await Notification.find({
      destinataire,
      archived: false,
    })
      .sort({ dateCreation: -1 })
      .populate('employe', 'nom prenom matricule');

    res.json(notifications);
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// جلب الإشعارات حسب المستلم
exports.getNotificationsByDestinataire = async (req, res) => {
  try {
    const { role } = req.params;

    const notifications = await Notification.find({
      destinataire: role,
      archived: false
    }).sort({ dateCreation: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// جلب عدد الإشعارات غير المقروءة
exports.getUnreadNotificationsCount = async (req, res) => {
  try {
    const { destinataire } = req.query;

    if (!['admin', 'medecin', 'employe'].includes(destinataire)) {
      return res.status(400).json({ message: 'الدور غير صالح' });
    }

    const count = await Notification.countDocuments({
      destinataire,
      archived: false,
      lu: false
    });

    res.json({ count });
  } catch (error) {
    console.error('خطأ في جلب عدد الإشعارات غير المقروءة:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// تحديث إشعار كمقروء
exports.marquerCommeLu = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { lu: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    res.status(200).json({
      message: 'تم تحديث حالة الإشعار بنجاح',
      notification,
    });
  } catch (error) {
    console.error('خطأ في تحديث الإشعار:', error);
    res.status(500).json({
      message: 'خطأ في تحديث الإشعار',
      error: error.message,
    });
  }
};

// حذف إشعار
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }
    
    res.status(200).json({
      message: 'تم حذف الإشعار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    res.status(500).json({
      message: 'خطأ في حذف الإشعار',
      error: error.message,
    });
  }
};

// إنشاء إشعار (للاستخدام الداخلي من قبل وحدات أخرى)
exports.creerNotification = async (notificationData) => {
  try {
    if (!notificationData.message || !notificationData.destinataire) {
      throw new Error('البيانات غير كاملة');
    }

    const nouvelleNotification = new Notification({
      titre: notificationData.titre || 'إشعار جديد',
      type: notificationData.type || 'INFO',
      message: notificationData.message,
      destinataire: notificationData.destinataire,
      details: notificationData.details || {},
      dateCreation: new Date(),
      lu: false,
    });

    const notificationSauvegardee = await nouvelleNotification.save();
    console.log('تم إنشاء الإشعار بنجاح:', notificationSauvegardee);
    return notificationSauvegardee;
  } catch (error) {
    console.error('خطأ في إنشاء الإشعار:', error);
    throw error;
  }
};

// Make sure to export all functions
module.exports = exports;