import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Star, 
  Users, 
  ArrowRight,
  Zap,
  Target,
  Award,
  TrendingUp,
  Lock,
  CheckCircle,
  Eye,
  Keyboard,
  Monitor,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  totalLevels: number;
  category: 'performance' | 'accessibility' | 'seo' | 'security';
  tags: string[];
  prerequisites: number[];
  isActive: boolean;
  completedLevels?: number;
  progress?: number;
}

interface UserStats {
  id: number;
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  experience: number;
  pathsCompleted: number;
  levelsCompleted: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  type: string;
  category: string;
  pointsReward: number;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked?: boolean;
  progress?: number;
}

interface AccessibilityAudit {
  id: number;
  userId: string;
  url: string;
  viewport: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  perceivableScore: number;
  operableScore: number;
  understandableScore: number;
  robustScore: number;
  overallScore: number;
  colorContrastIssues: any[];
  keyboardNavigationIssues: any[];
  ariaIssues: any[];
  altTextIssues: any[];
  wcagALevel: boolean;
  wcagAALevel: boolean;
  wcagAAALevel: boolean;
  recommendations: any[];
  pointsEarned: number;
  badgesUnlocked: string[];
  createdAt: string;
}

export default function LearningPaths() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [auditUrl, setAuditUrl] = useState<string>("");
  const [auditViewport, setAuditViewport] = useState<string>("desktop");
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  // Fetch learning paths
  const { data: learningPaths = [], isLoading: isLoadingPaths } = useQuery<LearningPath[]>({
    queryKey: ['/api/learning-paths'],
    initialData: [],
  });

  // Fetch user stats (using demo user for now)
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user-stats', 'demo-user-current'],
    initialData: {
      id: 1,
      userId: 'demo-user-current',
      username: 'Usuario',
      totalPoints: 0,
      level: 1,
      experience: 0,
      pathsCompleted: 0,
      levelsCompleted: 0,
      achievementsUnlocked: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    initialData: [],
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery<UserStats[]>({
    queryKey: ['/api/leaderboard'],
    initialData: [],
  });

  // Fetch user's accessibility audits
  const { data: accessibilityAudits = [], refetch: refetchAudits } = useQuery<AccessibilityAudit[]>({
    queryKey: ['/api/user-accessibility-audits', 'demo-user-current'],
    initialData: [],
  });

  const categories = [
    { id: 'all', name: 'Todas', icon: '🎯' },
    { id: 'performance', name: 'Rendimiento', icon: '⚡' },
    { id: 'accessibility', name: 'Accesibilidad', icon: '♿' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'security', name: 'Seguridad', icon: '🔒' },
  ];

  const difficulties = [
    { id: 'all', name: 'Todos' },
    { id: 'beginner', name: 'Principiante' },
    { id: 'intermediate', name: 'Intermedio' },
    { id: 'advanced', name: 'Avanzado' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡';
      case 'accessibility': return '♿';
      case 'seo': return '🔍';
      case 'security': return '🔒';
      default: return '📚';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredPaths = learningPaths.filter(path => {
    const categoryMatch = selectedCategory === 'all' || path.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || path.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch && path.isActive;
  });

  const getExperienceForNextLevel = (currentLevel: number) => {
    return currentLevel * 500; // 500 points per level
  };

  const getProgressToNextLevel = (experience: number, level: number) => {
    const currentLevelExp = (level - 1) * 500;
    const nextLevelExp = level * 500;
    const progress = ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const runAccessibilityAudit = async () => {
    if (!auditUrl.trim()) return;
    
    setIsRunningAudit(true);
    try {
      const response = await fetch('/api/accessibility-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: auditUrl,
          viewport: auditViewport,
          userId: 'demo-user-current'
        })
      });
      
      const { auditId } = await response.json();
      
      // Poll for audit completion
      const pollAudit = async () => {
        const auditResponse = await fetch(`/api/accessibility-audit/${auditId}`);
        const audit = await auditResponse.json();
        
        if (audit.status === 'completed' || audit.status === 'failed') {
          setIsRunningAudit(false);
          refetchAudits();
          return;
        }
        
        setTimeout(pollAudit, 1000);
      };
      
      setTimeout(pollAudit, 1000);
    } catch (error) {
      console.error('Error running accessibility audit:', error);
      setIsRunningAudit(false);
    }
  };

  const getWCAGBadgeColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'AA': return 'bg-blue-100 text-blue-800 border-blue-300';  
      case 'AAA': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header con estadísticas del usuario */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎮 Rutas de Aprendizaje Gamificadas
              </h1>
              <p className="text-gray-600">
                Domina la optimización web mientras desbloqueas logros y subes de nivel
              </p>
            </div>
            
            {/* User Stats Card */}
            <Card className="lg:w-96">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userStats?.level}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{userStats?.username}</h3>
                    <p className="text-sm text-gray-600">{userStats?.totalPoints} puntos</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={getProgressToNextLevel(userStats?.experience || 0, userStats?.level || 1)} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-gray-500">
                        Nivel {(userStats?.level || 1) + 1}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{userStats?.pathsCompleted}</div>
                    <div className="text-xs text-gray-600">Rutas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{userStats?.levelsCompleted}</div>
                    <div className="text-xs text-gray-600">Niveles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{userStats?.currentStreak}</div>
                    <div className="text-xs text-gray-600">Racha</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="paths" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Rutas de Aprendizaje
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Auditoría de Accesibilidad
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Clasificación
            </TabsTrigger>
          </TabsList>

          {/* Learning Paths Tab */}
          <TabsContent value="paths">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dificultad</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map(difficulty => (
                    <Button
                      key={difficulty.id}
                      variant={selectedDifficulty === difficulty.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty.id)}
                    >
                      {difficulty.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Paths Grid */}
            {isLoadingPaths ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando rutas de aprendizaje...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPaths.map((path) => (
                  <Card key={path.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCategoryIcon(path.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{path.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {path.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress if started */}
                        {path.progress !== undefined && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progreso</span>
                              <span>{path.completedLevels || 0}/{path.totalLevels}</span>
                            </div>
                            <Progress value={path.progress} className="h-2" />
                          </div>
                        )}

                        {/* Path Info */}
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getDifficultyColor(path.difficulty)}>
                            {path.difficulty}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {path.estimatedDuration}h
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {path.totalLevels} niveles
                          </Badge>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {path.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {path.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{path.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Prerequisites */}
                        {path.prerequisites.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-amber-600">
                            <Lock className="w-4 h-4" />
                            <span>Requiere completar otras rutas</span>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button 
                          className="w-full flex items-center gap-2" 
                          disabled={path.prerequisites.length > 0}
                        >
                          {path.progress !== undefined ? (
                            <>
                              <span>Continuar</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>Comenzar</span>
                              <Zap className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Accessibility Audit Tab */}
          <TabsContent value="accessibility">
            <div className="space-y-6">
              {/* Audit Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Nueva Auditoría de Accesibilidad
                  </CardTitle>
                  <CardDescription>
                    Ejecuta una auditoría completa WCAG para obtener puntos y desbloquear logros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        placeholder="https://ejemplo.com"
                        value={auditUrl}
                        onChange={(e) => setAuditUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={auditViewport}
                        onChange={(e) => setAuditViewport(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                        <option value="tablet">Tablet</option>
                      </select>
                    </div>
                    <Button 
                      onClick={runAccessibilityAudit}
                      disabled={isRunningAudit || !auditUrl.trim()}
                      className="flex items-center gap-2"
                    >
                      {isRunningAudit ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Auditar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Audits */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Auditorías Recientes</h3>
                
                {accessibilityAudits.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No hay auditorías aún
                      </h4>
                      <p className="text-gray-600">
                        Ejecuta tu primera auditoría de accesibilidad para comenzar a ganar puntos
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {accessibilityAudits.map((audit) => (
                      <Card key={audit.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg truncate">{audit.url}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Monitor className="w-4 h-4" />
                                {audit.viewport}
                                <span className="text-gray-400">•</span>
                                {new Date(audit.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-2xl font-bold ${getScoreColor(audit.overallScore)}`}>
                                {audit.overallScore}
                              </span>
                              <span className="text-xs text-gray-500">Puntuación</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {audit.status === 'pending' || audit.status === 'processing' ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              <span className="ml-3 text-gray-600">
                                {audit.status === 'pending' ? 'En cola...' : 'Procesando...'}
                              </span>
                            </div>
                          ) : audit.status === 'failed' ? (
                            <div className="flex items-center justify-center py-8 text-red-600">
                              <AlertCircle className="w-6 h-6 mr-2" />
                              <span>Error en la auditoría</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* WCAG Scores */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium">Perceptible</span>
                                  </div>
                                  <span className={`text-lg font-bold ${getScoreColor(audit.perceivableScore)}`}>
                                    {audit.perceivableScore}
                                  </span>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Keyboard className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium">Operable</span>
                                  </div>
                                  <span className={`text-lg font-bold ${getScoreColor(audit.operableScore)}`}>
                                    {audit.operableScore}
                                  </span>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm font-medium">Comprensible</span>
                                  </div>
                                  <span className={`text-lg font-bold ${getScoreColor(audit.understandableScore)}`}>
                                    {audit.understandableScore}
                                  </span>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium">Robusto</span>
                                  </div>
                                  <span className={`text-lg font-bold ${getScoreColor(audit.robustScore)}`}>
                                    {audit.robustScore}
                                  </span>
                                </div>
                              </div>

                              {/* WCAG Compliance */}
                              <div className="flex gap-2">
                                {audit.wcagALevel && (
                                  <Badge className={getWCAGBadgeColor('A')} variant="outline">
                                    WCAG A
                                  </Badge>
                                )}
                                {audit.wcagAALevel && (
                                  <Badge className={getWCAGBadgeColor('AA')} variant="outline">
                                    WCAG AA
                                  </Badge>
                                )}
                                {audit.wcagAAALevel && (
                                  <Badge className={getWCAGBadgeColor('AAA')} variant="outline">
                                    WCAG AAA
                                  </Badge>
                                )}
                              </div>

                              {/* Issues Summary */}
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center justify-between">
                                  <span>Problemas encontrados:</span>
                                  <span className="font-medium">
                                    {(audit.colorContrastIssues?.length || 0) + 
                                     (audit.keyboardNavigationIssues?.length || 0) + 
                                     (audit.ariaIssues?.length || 0) + 
                                     (audit.altTextIssues?.length || 0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Puntos ganados:</span>
                                  <span className="font-medium text-green-600">
                                    +{audit.pointsEarned}
                                  </span>
                                </div>
                              </div>

                              {/* Badges Unlocked */}
                              {audit.badgesUnlocked && audit.badgesUnlocked.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Logros desbloqueados:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {audit.badgesUnlocked.map((badge, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        🏆 {badge}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`${achievement.isUnlocked ? 'border-green-200 bg-green-50' : 'opacity-75'}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {achievement.title}
                          {achievement.isUnlocked && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getBadgeColor(achievement.badgeLevel)} variant="outline">
                        {achievement.badgeLevel}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        {achievement.pointsReward} pts
                      </div>
                    </div>
                    
                    {achievement.progress !== undefined && !achievement.isUnlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Clasificación Global
                </CardTitle>
                <CardDescription>
                  Los mejores estudiantes de optimización web
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{user.username}</h4>
                        <p className="text-sm text-gray-600">Nivel {user.level}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">{user.totalPoints}</div>
                        <div className="text-sm text-gray-600">puntos</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{user.pathsCompleted}</div>
                        <div className="text-sm text-gray-600">rutas</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-orange-600">
                          <span className="font-semibold">{user.currentStreak}</span>
                          <span className="text-sm">🔥</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}