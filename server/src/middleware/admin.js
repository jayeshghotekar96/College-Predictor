/**
 * Admin role guard — requires user to be authenticated and have admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
