import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Database, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: number;
  name: string;
  description?: string;
  applications: Application[];
}

interface Application {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  environments: any[];
}

interface ApplicationsManagerProps {
  projects: Project[];
  editingApplication: Application | null;
  setEditingApplication: (application: Application | null) => void;
  createApplicationMutation: any;
  updateApplicationMutation: any;
  deleteApplicationMutation: any;
}

export function ApplicationsManager({
  projects,
  editingApplication,
  setEditingApplication,
  createApplicationMutation,
  updateApplicationMutation,
  deleteApplicationMutation
}: ApplicationsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newApplication, setNewApplication] = useState({ 
    projectId: '', 
    name: '', 
    description: '' 
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<Application | null>(null);

  // Get all applications from all projects
  const allApplications = projects.flatMap(project => 
    project.applications.map(app => ({
      ...app,
      projectName: project.name
    }))
  );

  const handleCreateApplication = () => {
    if (!newApplication.projectId || !newApplication.name.trim()) return;
    
    createApplicationMutation.mutate({
      projectId: parseInt(newApplication.projectId),
      name: newApplication.name,
      description: newApplication.description
    }, {
      onSuccess: () => {
        setNewApplication({ projectId: '', name: '', description: '' });
        setShowCreateDialog(false);
      }
    });
  };

  const handleUpdateApplication = () => {
    if (!editingApplication || !editingApplication.name.trim()) return;
    
    updateApplicationMutation.mutate({
      id: editingApplication.id,
      data: {
        name: editingApplication.name,
        description: editingApplication.description
      }
    });
  };

  const handleDeleteApplication = (application: Application) => {
    deleteApplicationMutation.mutate(application.id, {
      onSuccess: () => setShowDeleteDialog(null)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Aplicaciones</h2>
          <p className="text-muted-foreground">Administra las aplicaciones dentro de cada proyecto</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={projects.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Aplicación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Aplicación</DialogTitle>
              <DialogDescription>
                Selecciona un proyecto y define la información de la aplicación
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-project">Proyecto *</Label>
                <Select value={newApplication.projectId} onValueChange={(value) => 
                  setNewApplication(prev => ({ ...prev, projectId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="app-name">Nombre de la Aplicación *</Label>
                <Input
                  id="app-name"
                  value={newApplication.name}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Frontend Web, API Backend, etc."
                />
              </div>
              <div>
                <Label htmlFor="app-description">Descripción</Label>
                <Textarea
                  id="app-description"
                  value={newApplication.description}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional de la aplicación"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateApplication}
                disabled={!newApplication.projectId || !newApplication.name.trim() || createApplicationMutation.isPending}
              >
                {createApplicationMutation.isPending ? 'Creando...' : 'Crear Aplicación'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allApplications.map((application) => (
          <Card key={application.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    {editingApplication?.id === application.id ? (
                      <Input
                        value={editingApplication.name}
                        onChange={(e) => setEditingApplication({ ...editingApplication, name: e.target.value })}
                        className="h-8 text-base font-semibold"
                      />
                    ) : (
                      <CardTitle className="text-lg">{application.name}</CardTitle>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {(application as any).projectName}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {editingApplication?.id === application.id ? (
                    <>
                      <Button size="sm" variant="outline" onClick={handleUpdateApplication}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingApplication(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditingApplication(application)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowDeleteDialog(application)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingApplication?.id === application.id ? (
                <Textarea
                  value={editingApplication.description || ''}
                  onChange={(e) => setEditingApplication({ ...editingApplication, description: e.target.value })}
                  placeholder="Descripción de la aplicación"
                  rows={2}
                />
              ) : (
                <CardDescription>
                  {application.description || 'Sin descripción'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entornos:</span>
                  <span className="font-medium">{application.environments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creado:</span>
                  <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allApplications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay aplicaciones</h3>
            <p className="text-muted-foreground mb-4">
              {projects.length === 0 ? 
                'Primero necesitas crear un proyecto antes de agregar aplicaciones.' :
                'Comienza creando tu primera aplicación dentro de un proyecto.'
              }
            </p>
            {projects.length > 0 ? (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Aplicación
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Necesitas crear un proyecto primero
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Aplicación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la aplicación "{showDeleteDialog?.name}"?
            </DialogDescription>
          </DialogHeader>
          {showDeleteDialog && showDeleteDialog.environments.length > 0 && (
            <Alert>
              <AlertDescription>
                ⚠️ Esta aplicación tiene {showDeleteDialog.environments.length} entornos asociados. 
                Al eliminar la aplicación, también se eliminarán todos sus entornos.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDeleteApplication(showDeleteDialog)}
              disabled={deleteApplicationMutation.isPending}
            >
              {deleteApplicationMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}