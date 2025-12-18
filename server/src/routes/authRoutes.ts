import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// @route   GET /auth/google
router.get("/google", (req, res, next) => {
  const role = (req.query.role as string) || "CONSUMER"; // Default to Consumer
  if (req.session) {
    (req.session as any).tempRole = role;
    req.session.save();
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role,
  })(req, res, next);
});

// @route   GET /auth/google/callback

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const user = req.user as any;

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // 3. Redirect to Frontend with token
    res.redirect(`${process.env.CLIENT_URL}/google/callback`);
  }
);

router.get("/current_user", (req, res) => {
  res.send(req.user);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

export default router;
