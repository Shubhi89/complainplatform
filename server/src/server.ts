import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import session from "express-session";
import passport from "passport";
import "./config/passport";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import businessRoutes from "./routes/businessRoutes";
import complaintRoutes from "./routes/complaintRoutes";
import { attachUser } from "./middleware/jwtAuth";

// Connect to Database
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logger

// Session Configuration
app.use(
  session({
    secret: process.env.COOKIE_KEY || "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure:true,
      sameSite: "none",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(attachUser);

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/business", businessRoutes);

app.use("/api/complaints", complaintRoutes);

// Basic  Route
app.get("/", (req: Request, res: Response) => {
  res.send(" Complaint Platform is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
