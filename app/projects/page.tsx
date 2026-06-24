"use client";

import { useEffect, useState } from "react";

interface Project {
  _id: string;
  title: string;
  language: string;
  userEmail: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      }
    };

    fetchProjects();
  }, []);

  const handleRename = async (projectId: string, currentTitle: string) => {
    const newTitle = prompt("Enter new project name:", currentTitle);

    if (!newTitle) return;

    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        title: newTitle,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setProjects((prev) =>
        prev.map((project) =>
          project._id === projectId ? { ...project, title: newTitle } : project,
        ),
      );

      alert("Project renamed successfully!");
    }
  };
  const handleDelete = async (projectId: string) => {
    const confirmed = confirm("Are you sure you want to delete this project?");

    if (!confirmed) return;

    const response = await fetch(`/api/projects?projectId=${projectId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      setProjects((prev) =>
        prev.filter((project) => project._id !== projectId),
      );

      alert("Project deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() =>
              (window.location.href = `/?projectId=${project._id}`)
            }
            className="border border-zinc-700 rounded-lg p-4 bg-[#161922] cursor-pointer hover:border-emerald-500"
          >
            <h2 className="text-lg font-semibold">{project.title}</h2>

            <p className="text-zinc-400">Language: {project.language}</p>

            <p className="text-zinc-500 text-sm">{project.userEmail}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRename(project._id, project.title);
              }}
              className="mt-3 px-3 py-1 bg-blue-600 rounded text-sm"
            >
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(project._id);
              }}
              className="mt-3 ml-2 px-3 py-1 bg-red-600 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
