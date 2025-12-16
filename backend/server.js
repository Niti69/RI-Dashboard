require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fleetowner  = require('./routes/fleetowner')
const franchisePatner = require('./routes/franchisepartner')
const dashboardroutes = require('./routes/dashboard')
const applicationsRoute = require('./routes/application')
const kycRoute = require('./routes/kyc')
const teleRoute = require('./routes/tele')
const kycApprove = require('./routes/kycApprove')
const FieldVerification = require('./routes/fieldVerification')
const adminVerification = require('./routes/admin')
const staff = require('./routes/staff')
const auth = require('./routes/auth')
// Connect Database
connectDB();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",  // (React) 1st project
    "http://localhost:8080"   // (TypeScript)2nd Project
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Logistics platform API is running!");
});

// Define Routes
app.use("/api/auth",auth );
app.use('/api',dashboardroutes)
app.use("/api/fleetowner",fleetowner)
app.use("/api/franchisepartner",franchisePatner)
app.use("/api",applicationsRoute)
app.use("/api",teleRoute)
app.use("/api/kyc", kycRoute);
app.use('/api',kycApprove)
app.use('/api',FieldVerification)
app.use('/api',adminVerification);
app.use('/api/staff',staff)

const PORT = process.env.PORT || 5000;
//process.env.PORT which is 5001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
