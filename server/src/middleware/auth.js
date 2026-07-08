
// Extend Express Request type

/**
 * Auth is disabled because user data is now stored serverless on the client side.
 */
export async function requireAuth(req, res, next) {
  // Allow all for local admin routes without auth
  req.user = { role: "admin" };
  next();
}

export async function optionalAuth(req, res, next) {
  next();
}
