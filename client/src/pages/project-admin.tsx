import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Globe, 
  Server, 
  Database,
  Settings,
  Building,
  FolderOpen,
  BookOpen,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ProjectsManager } from "@/components/projects-manager";
import { ApplicationsManager } from "@/components/applications-manager";
import { EnvironmentsManager } from "@/components/environments-manager";

interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  applications: Application[];
}

interface Application {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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

interface UserStory {
  id: number;
  applicationId: number;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'testing' | 'done';
  storyPoints?: number;
  testUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StoryAnalysis {
  id: number;
  userStoryId: number;
  environmentId: number;
  analysisId?: number;
  testExecutedAt: string;
  testStatus: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  testDuration?: string;
  functionalTestPassed?: boolean;
  performanceBaseline?: number;
  performanceActual?: number;
  performanceDelta?: number;
  criticalIssues?: any[];
  recommendations?: any[];
  testNotes?: string;
  testerName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("projects");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Fetch projects with all related data
  const { data: projects = [], isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['/api/project-structure'],
    initialData: [],
  });

  // Get selected project data
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Fetch user stories for selected project
  const { data: userStories = [], isLoading: isLoadingStories } = useQuery<UserStory[]>({
    queryKey: ['/api/user-stories/project', selectedProjectId],
    enabled: !!selectedProjectId && (activeTab === 'stories' || activeTab === 'analyses'),
    initialData: [],
  });

  // Fetch story analyses for selected project
  const { data: storyAnalyses = [], isLoading: isLoadingAnalyses } = useQuery<StoryAnalysis[]>({
    queryKey: ['/api/story-analyses/project', selectedProjectId],
    enabled: !!selectedProjectId && activeTab === 'analyses',
    initialData: [],
  });

  // Mutations for CRUD operations
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error creando proyecto');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Proyecto creado exitosamente" });
      refetch();
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error actualizando proyecto');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Proyecto actualizado exitosamente" });
      setEditingProject(null);
      refetch();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error eliminando proyecto');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Proyecto eliminado exitosamente" });
      refetch();
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: { projectId: number; name: string; description?: string }) => {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error creando aplicación');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Aplicación creada exitosamente" });
      refetch();
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error actualizando aplicación');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Aplicación actualizada exitosamente" });
      setEditingApplication(null);
      refetch();
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error eliminando aplicación');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Aplicación eliminada exitosamente" });
      refetch();
    },
  });

  const createEnvironmentMutation = useMutation({
    mutationFn: async (data: { 
      applicationId: number; 
      name: string; 
      displayName: string; 
      url: string; 
      description?: string; 
      isActive: boolean 
    }) => {
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error creando entorno');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Entorno creado exitosamente" });
      refetch();
    },
  });

  const updateEnvironmentMutation = useMutation({
    mutationFn: async ({ id, data }: { 
      id: number; 
      data: { 
        name: string; 
        displayName: string; 
        url: string; 
        description?: string; 
        isActive: boolean 
      } 
    }) => {
      const response = await fetch(`/api/environments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error actualizando entorno');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Entorno actualizado exitosamente" });
      setEditingEnvironment(null);
      refetch();
    },
  });

  const deleteEnvironmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/environments/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error eliminando entorno');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Entorno eliminado exitosamente" });
      refetch();
    },
  });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando administración de proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="text-blue-600 text-2xl" size={32} />
              <h1 className="text-2xl font-medium text-gray-900">Administración de Proyectos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← Volver al Analizador
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Aplicaciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((acc, p) => acc + p.applications.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Entornos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((acc, p) => 
                      acc + p.applications.reduce((appAcc, a) => appAcc + a.environments.length, 0), 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {/* Project Selector */}
        {projects.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Seleccionar Proyecto</CardTitle>
              <CardDescription>
                Selecciona un proyecto para gestionar sus aplicaciones, entornos, historias y análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProjectId?.toString() || ""} onValueChange={(value) => setSelectedProjectId(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {project.name}
                        <Badge variant="outline" className="ml-2">
                          {project.applications.length} app{project.applications.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">🏢 Proyectos</TabsTrigger>
            <TabsTrigger value="applications" disabled={!selectedProjectId}>📱 Aplicaciones</TabsTrigger>
            <TabsTrigger value="environments" disabled={!selectedProjectId}>🌐 Entornos</TabsTrigger>
            <TabsTrigger value="stories" disabled={!selectedProjectId}>📚 Historias</TabsTrigger>
            <TabsTrigger value="analyses" disabled={!selectedProjectId}>📊 Análisis</TabsTrigger>
          </TabsList>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <ProjectsManager 
              projects={projects}
              editingProject={editingProject}
              setEditingProject={setEditingProject}
              createProjectMutation={createProjectMutation}
              updateProjectMutation={updateProjectMutation}
              deleteProjectMutation={deleteProjectMutation}
            />
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <Server className="mx-auto h-12 w-12 mb-4" />
                    <p>Selecciona un proyecto para gestionar sus aplicaciones</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ApplicationsManager 
                projects={[selectedProject!].filter(Boolean)}
                editingApplication={editingApplication}
                setEditingApplication={setEditingApplication}
                createApplicationMutation={createApplicationMutation}
                updateApplicationMutation={updateApplicationMutation}
                deleteApplicationMutation={deleteApplicationMutation}
              />
            )}
          </TabsContent>

          {/* Environments Tab */}
          <TabsContent value="environments" className="mt-6">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="mx-auto h-12 w-12 mb-4" />
                    <p>Selecciona un proyecto para gestionar sus entornos</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EnvironmentsManager 
                projects={[selectedProject!].filter(Boolean)}
                editingEnvironment={editingEnvironment}
                setEditingEnvironment={setEditingEnvironment}
                createEnvironmentMutation={createEnvironmentMutation}
                updateEnvironmentMutation={updateEnvironmentMutation}
                deleteEnvironmentMutation={deleteEnvironmentMutation}
                getEnvironmentBadgeColor={getEnvironmentBadgeColor}
              />
            )}
          </TabsContent>

          {/* User Stories Tab */}
          <TabsContent value="stories" className="mt-6">
            <div className="space-y-6">
              {!selectedProjectId ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="mx-auto h-12 w-12 mb-4" />
                      <p>Selecciona un proyecto para ver sus historias de usuario</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Historias de Usuario</CardTitle>
                    <CardDescription>
                      Historias de usuario del proyecto: {selectedProject?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStories ? (
                      <div className="text-center py-4">Cargando historias...</div>
                    ) : userStories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="mx-auto h-12 w-12 mb-4" />
                        <p>No hay historias de usuario para este proyecto</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userStories.map((story) => {
                          // Find the application this story belongs to
                          const application = selectedProject?.applications.find(app => app.id === story.applicationId);
                          
                          return (
                            <div key={story.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-gray-900">{story.title}</h4>
                                    {application && (
                                      <Badge variant="outline" className="text-xs">
                                        {application.name}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                                  
                                  {story.acceptanceCriteria && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-gray-700">Criterios de Aceptación:</p>
                                      <p className="text-xs text-gray-600">{story.acceptanceCriteria}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2 mt-3">
                                    <Badge variant={
                                      story.priority === 'critical' ? 'destructive' :
                                      story.priority === 'high' ? 'default' :
                                      story.priority === 'medium' ? 'secondary' : 'outline'
                                    }>
                                      {story.priority}
                                    </Badge>
                                    <Badge variant={
                                      story.status === 'done' ? 'default' :
                                      story.status === 'testing' ? 'secondary' :
                                      story.status === 'in-progress' ? 'outline' : 'outline'
                                    }>
                                      {story.status === 'done' && <CheckCircle className="w-3 h-3 mr-1" />}
                                      {story.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                                      {story.status}
                                    </Badge>
                                    {story.storyPoints && (
                                      <Badge variant="outline">{story.storyPoints} pts</Badge>
                                    )}
                                    {story.testUrl && (
                                      <Badge variant="outline">
                                        <Globe className="w-3 h-3 mr-1" />
                                        URL de prueba
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Story Analyses Tab */}
          <TabsContent value="analyses" className="mt-6">
            <div className="space-y-6">
              {!selectedProjectId ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                      <p>Selecciona un proyecto para ver los análisis de rendimiento</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Rendimiento por Historia</CardTitle>
                    <CardDescription>
                      Resultados de pruebas de rendimiento del proyecto: {selectedProject?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalyses ? (
                      <div className="text-center py-4">Cargando análisis...</div>
                    ) : storyAnalyses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                        <p>No hay análisis de rendimiento para este proyecto</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {storyAnalyses.map((analysis) => {
                          // Find the user story and environment for this analysis
                          const userStory = userStories.find(story => story.id === analysis.userStoryId);
                          const application = selectedProject?.applications.find(app => app.id === userStory?.applicationId);
                          const environment = application?.environments.find(env => env.id === analysis.environmentId);
                          
                          return (
                            <div key={analysis.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {userStory?.title || 'Historia no encontrada'}
                                    </h4>
                                    {application && (
                                      <Badge variant="outline" className="text-xs">
                                        {application.name}
                                      </Badge>
                                    )}
                                    {environment && (
                                      <Badge variant="secondary" className="text-xs">
                                        {environment.displayName}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant={
                                      analysis.testStatus === 'passed' ? 'default' :
                                      analysis.testStatus === 'failed' ? 'destructive' :
                                      analysis.testStatus === 'running' ? 'secondary' : 'outline'
                                    }>
                                      {analysis.testStatus === 'passed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                      {analysis.testStatus === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                                      {analysis.testStatus === 'running' && <Clock className="w-3 h-3 mr-1" />}
                                      {analysis.testStatus}
                                    </Badge>
                                    {analysis.testDuration && (
                                      <Badge variant="outline">{analysis.testDuration}s</Badge>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {new Date(analysis.testExecutedAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                    {analysis.performanceBaseline && analysis.performanceActual && (
                                      <div className="text-sm">
                                        <p className="font-medium">Rendimiento</p>
                                        <p className="text-gray-600">
                                          Baseline: {analysis.performanceBaseline}
                                        </p>
                                        <p className="text-gray-600">
                                          Actual: {analysis.performanceActual}
                                        </p>
                                        {analysis.performanceDelta && (
                                          <p className={`font-medium ${
                                            analysis.performanceDelta >= 0 ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            Delta: {analysis.performanceDelta >= 0 ? '+' : ''}{analysis.performanceDelta}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    
                                    {analysis.functionalTestPassed !== undefined && (
                                      <div className="text-sm">
                                        <p className="font-medium">Prueba Funcional</p>
                                        <p className={analysis.functionalTestPassed ? 'text-green-600' : 'text-red-600'}>
                                          {analysis.functionalTestPassed ? '✓ Pasó' : '✗ Falló'}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {analysis.testerName && (
                                      <div className="text-sm">
                                        <p className="font-medium">Tester</p>
                                        <p className="text-gray-600">{analysis.testerName}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {analysis.testNotes && (
                                    <div className="mt-3 text-sm">
                                      <p className="font-medium">Notas</p>
                                      <p className="text-gray-600">{analysis.testNotes}</p>
                                    </div>
                                  )}
                                  
                                  {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
                                    <div className="mt-3">
                                      <p className="font-medium text-red-600 text-sm mb-1">Problemas Críticos</p>
                                      <div className="space-y-1">
                                        {analysis.criticalIssues.map((issue: any, index: number) => (
                                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                            {issue.message}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

