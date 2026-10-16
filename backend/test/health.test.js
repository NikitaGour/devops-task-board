
import { test, before } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, initDatabase } from "../index.js";

before(async () => {
  await initDatabase();
});

test("GET /health returns a successful database health check", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: "healthy",
    database: "connected",
  });
});

test("POST /api/tasks creates a task", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({ title: "Learn Docker" });

  assert.equal(response.status, 201);
  assert.equal(response.body.title, "Learn Docker");
  assert.equal(response.body.completed, false);
  assert.ok(response.body.id);
});

test("POST /api/tasks rejects an empty title", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({ title: "   " });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "Task title is required",
  });
});

