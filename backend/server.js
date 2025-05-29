const express = require("express");
const connectDB = require("./app/config/db.config");
const cors = require("cors");
const fileSystemRoutes = require("./app/routes/fileSystem.routes");
const errorHandler = require("./app/middlewares/errorHandler.middleware");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

dotenv.config();

const app = express();

// Database connection
connectDB();

// CORS setup
const corsOptions = {
  origin: [
    process.env.CLIENT_URI,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
};
app.use(cors(corsOptions));

// Static files serving
app.use(express.static("public/uploads"));

// Middlewares to parse URL-encoded body & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/file-system", fileSystemRoutes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
