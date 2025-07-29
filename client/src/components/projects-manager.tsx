import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  applications: any[];
}

interface ProjectsManagerProps {
  projects: Project[];
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  createProjectMutation: any;
  updateProjectMutation: any;
  deleteProjectMutation: any;
}

export function ProjectsManager({
  projects,
  editingProject,
  setEditingProject,
  createProjectMutation,
  updateProjectMutation,
  deleteProjectMutation
}: ProjectsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [showDeleteDialog, setShowDeleteDialog] = useState<Project | null>(null);

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    
    createProjectMutation.mutate(newProject, {
      onSuccess: () => {
        setNewProject({ name: '', description: '' });
        setShowCreateDialog(false);
      }
    });
  };

  const handleUpdateProject = () => {
    if (!editingProject || !editingProject.name.trim()) return;
    
    updateProjectMutation.mutate({
      id: editingProject.id,
      data: {
        name: editingProject.name,
        description: editingProject.description
      }
    });
  };

  const handleDeleteProject = (project: Project) => {
    deleteProjectMutation.mutate(project.id, {
      onSuccess: () => setShowDeleteDialog(null)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Proyectos</h2>
          <p className="text-muted-foreground">Administra los proyectos y su información básica</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Ingresa la información básica del nuevo proyecto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Nombre del Proyecto *</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mi Nuevo Proyecto"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Descripción</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional del proyecto"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProject.name.trim() || createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  {editingProject?.id === project.id ? (
                    <Input
                      value={editingProject.name}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      className="h-8 text-base font-semibold"
                    />
                  ) : (
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  )}
                </div>
                <div className="flex gap-1">
                  {editingProject?.id === project.id ? (
                    <>
                      <Button size="sm" variant="outline" onClick={handleUpdateProject}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingProject(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditingProject(project)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowDeleteDialog(project)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingProject?.id === project.id ? (
                <Textarea
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Descripción del proyecto"
                  rows={2}
                />
              ) : (
                <CardDescription>
                  {project.description || 'Sin descripción'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aplicaciones:</span>
                  <span className="font-medium">{project.applications.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entornos:</span>
                  <span className="font-medium">
                    {project.applications.reduce((acc, app) => acc + (app.environments?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creado:</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay proyectos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primer proyecto para organizar tus aplicaciones y entornos.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Proyecto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el proyecto "{showDeleteDialog?.name}"?
            </DialogDescription>
          </DialogHeader>
          {showDeleteDialog && showDeleteDialog.applications.length > 0 && (
            <Alert>
              <AlertDescription>
                ⚠️ Este proyecto tiene {showDeleteDialog.applications.length} aplicaciones asociadas. 
                Al eliminar el proyecto, también se eliminarán todas sus aplicaciones y entornos.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDeleteProject(showDeleteDialog)}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}