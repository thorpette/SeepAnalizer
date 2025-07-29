import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Server, Database, Building, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: number;
  name: string;
  applications: Application[];
}

interface Application {
  id: number;
  projectId: number;
  name: string;
  environments: Environment[];
}

interface Environment {
  id: number;
  applicationId: number;
  name: string;
  displayName: string;
  url: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnvironmentsManagerProps {
  projects: Project[];
  editingEnvironment: Environment | null;
  setEditingEnvironment: (environment: Environment | null) => void;
  createEnvironmentMutation: any;
  updateEnvironmentMutation: any;
  deleteEnvironmentMutation: any;
  getEnvironmentBadgeColor: (envName: string) => string;
}

export function EnvironmentsManager({
  projects,
  editingEnvironment,
  setEditingEnvironment,
  createEnvironmentMutation,
  updateEnvironmentMutation,
  deleteEnvironmentMutation,
  getEnvironmentBadgeColor
}: EnvironmentsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEnvironment, setNewEnvironment] = useState({
    applicationId: '',
    name: '',
    displayName: '',
    url: '',
    description: '',
    isActive: true
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<Environment | null>(null);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterApplication, setFilterApplication] = useState<string>('all');

  // Get all environments from all projects/applications
  const allEnvironments = projects.flatMap(project =>
    project.applications.flatMap(app =>
      app.environments.map(env => ({
        ...env,
        projectName: project.name,
        applicationName: app.name,
        projectId: project.id
      }))
    )
  );

  // Filter environments based on selected filters
  const filteredEnvironments = allEnvironments.filter(env => {
    if (filterProject !== 'all' && env.projectId.toString() !== filterProject) return false;
    if (filterApplication !== 'all' && env.applicationId.toString() !== filterApplication) return false;
    return true;
  });

  // Get applications for the create dialog
  const allApplications = projects.flatMap(project =>
    project.applications.map(app => ({
      ...app,
      projectName: project.name
    }))
  );

  // Get available applications for current project filter
  const availableApplications = filterProject === 'all' 
    ? allApplications 
    : allApplications.filter(app => app.projectId.toString() === filterProject);

  const handleCreateEnvironment = () => {
    if (!newEnvironment.applicationId || !newEnvironment.name.trim() || !newEnvironment.displayName.trim() || !newEnvironment.url.trim()) return;
    
    createEnvironmentMutation.mutate({
      applicationId: parseInt(newEnvironment.applicationId),
      name: newEnvironment.name,
      displayName: newEnvironment.displayName,
      url: newEnvironment.url,
      description: newEnvironment.description,
      isActive: newEnvironment.isActive
    }, {
      onSuccess: () => {
        setNewEnvironment({
          applicationId: '',
          name: '',
          displayName: '',
          url: '',
          description: '',
          isActive: true
        });
        setShowCreateDialog(false);
      }
    });
  };

  const handleUpdateEnvironment = () => {
    if (!editingEnvironment || !editingEnvironment.name.trim() || !editingEnvironment.displayName.trim() || !editingEnvironment.url.trim()) return;
    
    updateEnvironmentMutation.mutate({
      id: editingEnvironment.id,
      data: {
        name: editingEnvironment.name,
        displayName: editingEnvironment.displayName,
        url: editingEnvironment.url,
        description: editingEnvironment.description,
        isActive: editingEnvironment.isActive
      }
    });
  };

  const handleDeleteEnvironment = (environment: Environment) => {
    deleteEnvironmentMutation.mutate(environment.id, {
      onSuccess: () => setShowDeleteDialog(null)
    });
  };

  const presetEnvironments = [
    { name: 'dev', displayName: 'Desarrollo', urlExample: 'https://dev-app.ejemplo.com' },
    { name: 'staging', displayName: 'Staging', urlExample: 'https://staging-app.ejemplo.com' },
    { name: 'prod', displayName: 'Producción', urlExample: 'https://app.ejemplo.com' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Filters and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Entornos</h2>
          <p className="text-muted-foreground">Administra los entornos de despliegue para cada aplicación</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterApplication} onValueChange={setFilterApplication}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por aplicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las aplicaciones</SelectItem>
              {availableApplications.map((app) => (
                <SelectItem key={app.id} value={app.id.toString()}>
                  {app.name} ({(app as any).projectName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button disabled={allApplications.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Entorno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Entorno</DialogTitle>
                <DialogDescription>
                  Define un entorno de despliegue para una aplicación específica
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="env-application">Aplicación *</Label>
                  <Select value={newEnvironment.applicationId} onValueChange={(value) => 
                    setNewEnvironment(prev => ({ ...prev, applicationId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una aplicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {allApplications.map((app) => (
                        <SelectItem key={app.id} value={app.id.toString()}>
                          {app.name} - {(app as any).projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preset Environment Options */}
                <div>
                  <Label>Configuración Rápida</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {presetEnvironments.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewEnvironment(prev => ({
                          ...prev,
                          name: preset.name,
                          displayName: preset.displayName,
                          url: preset.urlExample
                        }))}
                      >
                        {preset.displayName}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="env-name">Nombre Técnico *</Label>
                    <Input
                      id="env-name"
                      value={newEnvironment.name}
                      onChange={(e) => setNewEnvironment(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="dev, staging, prod"
                    />
                  </div>
                  <div>
                    <Label htmlFor="env-display-name">Nombre para Mostrar *</Label>
                    <Input
                      id="env-display-name"
                      value={newEnvironment.displayName}
                      onChange={(e) => setNewEnvironment(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Desarrollo, Staging, Producción"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="env-url">URL del Entorno *</Label>
                  <Input
                    id="env-url"
                    type="url"
                    value={newEnvironment.url}
                    onChange={(e) => setNewEnvironment(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://mi-app.ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="env-description">Descripción</Label>
                  <Textarea
                    id="env-description"
                    value={newEnvironment.description}
                    onChange={(e) => setNewEnvironment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción opcional del entorno"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="env-active"
                    checked={newEnvironment.isActive}
                    onCheckedChange={(checked) => setNewEnvironment(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="env-active">Entorno activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateEnvironment}
                  disabled={!newEnvironment.applicationId || !newEnvironment.name.trim() || !newEnvironment.displayName.trim() || !newEnvironment.url.trim() || createEnvironmentMutation.isPending}
                >
                  {createEnvironmentMutation.isPending ? 'Creando...' : 'Crear Entorno'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Environments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEnvironments.map((environment) => (
          <Card key={environment.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-purple-600" />
                    <Badge className={getEnvironmentBadgeColor(environment.name)}>
                      {editingEnvironment?.id === environment.id ? (
                        <Input
                          value={editingEnvironment.displayName}
                          onChange={(e) => setEditingEnvironment({ ...editingEnvironment, displayName: e.target.value })}
                          className="h-5 w-20 text-xs p-1"
                        />
                      ) : (
                        environment.displayName
                      )}
                    </Badge>
                    {!environment.isActive && (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{(environment as any).projectName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{(environment as any).applicationName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {editingEnvironment?.id === environment.id ? (
                    <>
                      <Button size="sm" variant="outline" onClick={handleUpdateEnvironment}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingEnvironment(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditingEnvironment(environment)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowDeleteDialog(environment)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {editingEnvironment?.id === environment.id ? (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Nombre técnico</Label>
                      <Input
                        value={editingEnvironment.name}
                        onChange={(e) => setEditingEnvironment({ ...editingEnvironment, name: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={editingEnvironment.url}
                        onChange={(e) => setEditingEnvironment({ ...editingEnvironment, url: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Textarea
                        value={editingEnvironment.description || ''}
                        onChange={(e) => setEditingEnvironment({ ...editingEnvironment, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingEnvironment.isActive}
                        onCheckedChange={(checked) => setEditingEnvironment({ ...editingEnvironment, isActive: checked })}
                      />
                      <Label className="text-xs">Activo</Label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                        {environment.url}
                      </code>
                    </div>
                    
                    {environment.description && (
                      <p className="text-sm text-muted-foreground">
                        {environment.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Creado: {new Date(environment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEnvironments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay entornos</h3>
            <p className="text-muted-foreground mb-4">
              {allApplications.length === 0 ? 
                'Primero necesitas crear proyectos y aplicaciones antes de agregar entornos.' :
                'Comienza creando tu primer entorno de despliegue.'
              }
            </p>
            {allApplications.length > 0 ? (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Entorno
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Necesitas crear aplicaciones primero
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Entorno</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el entorno "{showDeleteDialog?.displayName}" ({showDeleteDialog?.url})?
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              ⚠️ Esta acción no se puede deshacer. Se eliminarán todas las configuraciones del entorno.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDeleteEnvironment(showDeleteDialog)}
              disabled={deleteEnvironmentMutation.isPending}
            >
              {deleteEnvironmentMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}