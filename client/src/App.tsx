import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Gauge, Diamond } from "lucide-react";
import Home from "@/pages/home";
import RubyAgentPage from "@/pages/ruby-agent";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link 
            href="/"
            className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
              location === "/" 
                ? "border-google-blue text-google-blue" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Gauge className="w-4 h-4 mr-2" />
            Análisis Principal
          </Link>
          <Link 
            href="/ruby-agent"
            className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
              location === "/ruby-agent" 
                ? "border-red-500 text-red-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Diamond className="w-4 h-4 mr-2" />
            Agente Ruby
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ruby-agent" component={RubyAgentPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
