export const isMapRangerOrAdmin = (req, res, next) => {
  if (req.user.role !== "mapRanger" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Map Ranger or Admin role required." });
  }
  next();
};
