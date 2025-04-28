const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path"); // Import path module for serving static files

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Client API",
      version: "1.0.0",
      description: "API documentation for managing clients",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "apiKey",
          in: "header", // The token will be in the header
          name: "Token", // Custom header name 'Token'
          description: "JWT Bearer token",
        },
      },
    },
    security: [
      {
        BearerAuth: [], // Apply BearerAuth security globally
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your routes files (you can adjust this path as needed)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Use Swagger UI for API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve static files (index.html, CSS, JS) from another project folder
app.use(
  express.static(path.join(__dirname, "../client-portal-frontend/public"))
); // Serve from /other-project-folder/public

// MongoDB Connection
// Access MongoDB URI from the environment variable
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/secretaries", require("./routes/secretaryRoutes"));
app.use("/api/shareholders", require("./routes/shareholderRoutes"));
app.use("/api/service", require("./routes/serviceRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
