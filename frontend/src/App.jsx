
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Could not load tasks");

      setTasks(await response.json());
      setError("");
    } catch {
      setError("Unable to connect to the API.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Could not add task");

      setTitle("");
      await loadTasks();
    } catch {
      setError("Could not add the task.");
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) throw new Error("Could not update task");

      await loadTasks();
    } catch {
      setError("Could not update the task.");
    }
  }

  return (
    <main className="container">
      <p className="eyebrow">DEVOPS PORTFOLIO PROJECT</p>
      <h1>DevOps Task Board</h1>
      <p className="subtitle">
        One application. One complete delivery pipeline.
      </p>

      <form onSubmit={addTask} className="task-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Tasks ({tasks.length})</h2>

        {tasks.map((task) => (
          <label className="task" key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
            <span className={task.completed ? "completed" : ""}>
              {task.title}
            </span>
          </label>
        ))}

        {tasks.length === 0 && !error && (
          <p>No tasks yet. Add your first!</p>
        )}
      </section>
    </main>
  );
}

export default App;
