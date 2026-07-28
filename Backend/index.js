const dotenv = require("dotenv");
dotenv.config();

// dotenv.config() must run before anything below is required
const express = require("express");
const cors = require("cors");

const productRoutes    = require("./Routers/ProductsRoute");
const orderRoutes      = require("./Routers/OrdersRoute");
const orderItemsRoutes = require("./Routers/OrderItemsRoute");
const paymentRoutes    = require("./Routers/PaymentRoute");
const categoryRoutes   = require("./Routers/CategoryRoute");
const usersRoutes      = require("./Routers/UsersRoute");
const uploadRoutes     = require("./Routers/UploadRoute");
const authRoutes       = require("./Routers/AuthRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────
// Include local dev, live domain, and Vercel fallback
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://emsarj.net",
  "https://www.emsarj.net",   // ← add this
  "https://emsarj-clothing-line.vercel.app"
];


app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ── Body parsing ─────────────────────────────────────────
// Skip JSON parsing for Paystack webhook to preserve raw body
app.use((req, res, next) => {
  if (req.originalUrl === "/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// ── Routers ─────────────────────────────────────────────
app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/order-items", orderItemsRoutes);
app.use("/payments", paymentRoutes);
app.use("/categories", categoryRoutes);
app.use("/api/users", usersRoutes);
app.use("/auth", authRoutes);

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
