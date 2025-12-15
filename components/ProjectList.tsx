'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createProject, deleteProject } from '@/lib/queries/projects';
import type { Project } from '@/types';

export default function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const project = await createProject(newProjectName, newProjectDescription || undefined);
      setProjects([project, ...projects]);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project and all its issues?')) return;

    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="space-y-4">
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + New Project
        </button>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow space-y-3">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
          <textarea
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/projects/${project.id}`} className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                  {project.name}
                </h3>
              </Link>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-gray-400 hover:text-red-600 ml-2"
                aria-label="Delete project"
              >
                ×
              </button>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
            )}
            <Link
              href={`/projects/${project.id}`}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View board →
            </Link>
          </div>
        ))}
      </div>

      {projects.length === 0 && !isCreating && (
        <p className="text-center text-gray-500 py-12">No projects yet. Create your first one!</p>
      )}
    </div>
  );
}
