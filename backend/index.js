
import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import * as promClient from "@prometheus-io/client";

dotenv.config();

const app = express();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// Collect default Node.js process metrics
promClient.collectDefaultMetrics();

// Track total HTTP requests
const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Track HTTP request duration
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Track requests currently being processed
const httpRequestsInProgress = new promClient.Gauge({
  name: "http_requests_in_progress",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method"],
});

// Middleware to measure HTTP requests
app.use((req, res, next) => {
  // Don't count Prometheus scrapes as application requests
  if (req.path === "/metrics") {
    return next();
  }

  const method = req.method;
  httpRequestsInProgress.inc({ method });

  const endTimer = httpRequestDuration.startTimer({ method });

  res.on("finish", () => {
    // Use route templates to avoid creating a separate metric
    // for every task ID
    const route = req.route
      ? `${req.baseUrl}${req.route.path}`
      : "unmatched";

    const statusCode = String(res.statusCode);

    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    endTimer({
      route,
      status_code: statusCode,
    });

    httpRequestsInProgress.dec({ method });
  });

  next();
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
    console.error("Failed to generate metrics:", error);
    res.status(500).send("Failed to generate metrics");
  }
});

// Health check: verifies both API and database
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

// Fetch all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create a task
app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Mark a task complete or incomplete
app.patch("/api/tasks/:id", async (req, res) => {
  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: "completed must be a boolean",
    });
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Initialize the database table
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// Start the API
async function start() {
  await initDatabase();

  const port = process.env.PORT || 5000;

  app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on port ${port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Failed to start API:", error);
    process.exit(1);
  });
}

export { app, initDatabase };

