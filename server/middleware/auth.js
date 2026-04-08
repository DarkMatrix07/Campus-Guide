const isAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

const isOwner = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { isAuth, isAdmin, isOwner, isStudent };
