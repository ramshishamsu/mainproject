export const adminOnly = (req, res, next) => {
  console.log('Admin middleware check:');
  console.log('User:', req.user);
  console.log('User role:', req.user?.role);
  console.log('User email:', req.user?.email);
  
  if (!req.user) {
    return res.status(401).json({
      message: "User not authenticated"
    });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
      currentUserRole: req.user.role,
      currentUserEmail: req.user.email
    });
  }
  next();
};
