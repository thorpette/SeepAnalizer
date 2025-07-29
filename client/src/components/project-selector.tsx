import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings, Globe, Server, Database } from "lucide-react";

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
}

interface ProjectSelectorProps {
  onSelectionChange: (selection: {
    projectId?: number;
    applicationId?: number;
    environmentId?: number;
    url?: string;
    device: 'desktop' | 'mobile';
  }) => void;
  device: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
}

export function ProjectSelector({ onSelectionChange, device, onDeviceChange }: ProjectSelectorProps) {
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [selectedApplication, setSelectedApplication] = useState<number | undefined>();
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | undefined>();
  const [customUrl, setCustomUrl] = useState("");
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  
  // Fetch project structure
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/project-structure'],
    initialData: [],
  });

  // Get filtered applications
  const applications = selectedProject 
    ? projects.find(p => p.id === selectedProject)?.applications || []
    : [];

  // Get filtered environments
  const environments = selectedApplication
    ? applications.find(a => a.id === selectedApplication)?.environments || []
    : [];

  // Update selection when values change
  useEffect(() => {
    let url = customUrl;
    
    if (!useCustomUrl && selectedEnvironment) {
      const env = environments.find(e => e.id === selectedEnvironment);
      url = env?.url || "";
    }

    onSelectionChange({
      projectId: selectedProject,
      applicationId: selectedApplication,
      environmentId: useCustomUrl ? undefined : selectedEnvironment,
      url: url || undefined,
      device,
    });
  }, [selectedProject, selectedApplication, selectedEnvironment, customUrl, useCustomUrl, device, onSelectionChange, environments]);

  // Reset child selections when parent changes
  useEffect(() => {
    setSelectedApplication(undefined);
    setSelectedEnvironment(undefined);
  }, [selectedProject]);

  useEffect(() => {
    setSelectedEnvironment(undefined);
  }, [selectedApplication]);

  const getEnvironmentBadgeColor = (envName: string) => {
    switch (envName.toLowerCase()) {
      case 'prod':
      case 'production':
      case 'producción':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'staging':
      case 'stage':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'dev':
      case 'development':
      case 'desarrollo':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando proyectos...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Selección de Proyecto y Entorno
            </CardTitle>
            <CardDescription>
              Elige un proyecto, aplicación y entorno para analizar, o usa una URL personalizada
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <NewProjectDialog />
            <ManageProjectsDialog />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Device Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Dispositivo</Label>
            <Select value={device} onValueChange={onDeviceChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">🖥️ Escritorio</SelectItem>
                <SelectItem value="mobile">📱 Móvil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant={useCustomUrl ? "outline" : "default"}
              onClick={() => setUseCustomUrl(!useCustomUrl)}
              className="w-full"
            >
              {useCustomUrl ? "Usar Entorno" : "URL Personalizada"}
            </Button>
          </div>
        </div>

        {!useCustomUrl ? (
          <div className="space-y-4">
            {/* Project Selection */}
            <div>
              <Label>Proyecto</Label>
              <Select value={selectedProject?.toString()} onValueChange={(value) => setSelectedProject(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Application Selection */}
            {selectedProject && (
              <div>
                <Label>Aplicación</Label>
                <Select value={selectedApplication?.toString()} onValueChange={(value) => setSelectedApplication(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una aplicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          {app.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Environment Selection */}
            {selectedApplication && (
              <div>
                <Label>Entorno</Label>
                <div className="grid grid-cols-1 gap-2">
                  {environments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay entornos configurados</p>
                  ) : (
                    environments.map((env) => (
                      <div
                        key={env.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedEnvironment === env.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedEnvironment(env.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getEnvironmentBadgeColor(env.name)}>
                              {env.displayName}
                            </Badge>
                            <span className="font-medium">{env.name}</span>
                          </div>
                          {!env.isActive && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{env.url}</p>
                        {env.description && (
                          <p className="text-xs text-muted-foreground mt-1">{env.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Label htmlFor="custom-url">URL Personalizada</Label>
            <Input
              id="custom-url"
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              className="mt-1"
            />
          </div>
        )}

        {/* Current Selection Summary */}
        {(selectedEnvironment || customUrl) && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Configuración del Análisis</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Dispositivo:</strong> {device === 'desktop' ? 'Escritorio' : 'Móvil'}</div>
              {!useCustomUrl && selectedProject && (
                <>
                  <div><strong>Proyecto:</strong> {projects.find(p => p.id === selectedProject)?.name}</div>
                  {selectedApplication && (
                    <div><strong>Aplicación:</strong> {applications.find(a => a.id === selectedApplication)?.name}</div>
                  )}
                  {selectedEnvironment && (
                    <div><strong>Entorno:</strong> {environments.find(e => e.id === selectedEnvironment)?.displayName}</div>
                  )}
                </>
              )}
              <div><strong>URL:</strong> {useCustomUrl ? customUrl : environments.find(e => e.id === selectedEnvironment)?.url}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder components for project management
function NewProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Funcionalidad de gestión de proyectos próximamente disponible
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function ManageProjectsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Gestionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestión de Proyectos</DialogTitle>
          <DialogDescription>
            Funcionalidad de gestión de proyectos próximamente disponible
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}