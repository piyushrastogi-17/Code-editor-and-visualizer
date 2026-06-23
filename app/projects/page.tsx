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
          </div>
        ))}
      </div>
    </div>
  );
}
