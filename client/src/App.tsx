import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ChatPage from "@/pages/chat";
import LandingPage from "@/pages/landing";
import AIPlayground from "@/pages/AIPlayground";
import AIStudio from "@/pages/AIStudio";
import XAIEnterprise from "./pages/XAIEnterprise";
import GitHubIntegration from "./components/github/github-integration";
import NotFound from "@/pages/not-found";
import EnterpriseMonitoring from "./pages/EnterpriseMonitoring";
import EnterpriseVisualization from "./pages/EnterpriseVisualization";
import GitHubManagement from "./pages/GitHubManagement";
import SecurityCenter from "./pages/SecurityCenter";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          <Route path="/" component={ChatPage} />
          <Route path="/chat/:id?" component={ChatPage} />
          <Route path="/ai-playground" component={AIPlayground} />
          <Route path="/ai-studio" component={AIStudio} />
          <Route path="/xai-enterprise" component={XAIEnterprise} />
          <Route path="/github" component={GitHubIntegration} />
          <Route path="/monitoring" component={EnterpriseMonitoring} />
          <Route path="/enterprise-visualization" component={EnterpriseVisualization} />
          <Route path="/github-management" component={GitHubManagement} />
          <Route path="/security-center" component={SecurityCenter} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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