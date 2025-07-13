import { useState, useEffect } from "react";
import { Settings, Globe, Moon, Sun, Variable } from "lucide-react";
import { RequestBuilder } from "./components/RequestBuilder";
import { ResponseViewer } from "./components/ResponseViewer";
import { WorkspaceSelector } from "./components/WorkspaceSelector";
import { WorkspaceModal } from "./components/WorkspaceModal";
import { VariablesModal } from "./components/VariablesModal";
import { SavedRequestsList } from "./components/SavedRequestsList";
import { EmptyRequestState } from "./components/EmptyRequestState";
import { SelectRequestState } from "./components/SelectRequestState";
import { WorkspaceProvider, useWorkspace } from "./contexts/WorkspaceContext";
import { invoke } from "@tauri-apps/api/core";
import { WorkspaceRequest } from "./types/workspace";
import "./App.css";

function AppContent() {
  const { currentWorkspace, deleteRequest } = useWorkspace();
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | undefined>(
    undefined
  );
  const [responseHeaders, setResponseHeaders] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [elapsedTime, setElapsedTime] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkspaceRequest | null>(null);

  // Déterminer si on a des requêtes dans le workspace actuel
  const hasRequests = currentWorkspace?.requests?.length > 0;

  // Synchroniser selectedRequest avec le workspace - si la requête sélectionnée n'existe plus, la désélectionner
  useEffect(() => {
    if (selectedRequest && currentWorkspace) {
      const requestExists = currentWorkspace.requests.some(req => req.id === selectedRequest.id);
      if (!requestExists) {
        setSelectedRequest(null);
      }
    }
  }, [currentWorkspace, selectedRequest]);

  // Gérer le thème au chargement et lors des changements
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSendRequest = async (
    method: string,
    url: string,
    headers: string,
    body: string
  ) => {
    setIsLoading(true);

    try {
      // ADD MAKE REQUEST FUNCTION IN RUST
      const result = await invoke("make_request", {
        url: url,
        method: method,
        headersStr: headers,
        body: body,
      });

      // Le résultat est de type HttpResponse depuis Rust
      const httpResponse = result as {
        status: number;
        status_text: string;
        headers: Record<string, string>;
        body: string;
        elapsed_ms: number;
      };

      // Séparer le body des autres métadonnées
      setResponse(httpResponse.body);
      setResponseStatus(httpResponse.status);
      setResponseHeaders(httpResponse.headers);
      setElapsedTime(httpResponse.elapsed_ms);

      // Mettre à jour la requête sélectionnée si elle existe
      if (selectedRequest) {
        // Optionnel : mettre à jour lastUsed ou d'autres métadonnées
      }
    } catch (error: any) {
      // Gestion des erreurs depuis Rust
      console.error("Request failed:", error);

      const errorResponse = {
        error: true,
        message: error.message || "Request failed",
        code: error.code || "UNKNOWN_ERROR",
        timestamp: new Date().toISOString(),
      };

      setResponse(JSON.stringify(errorResponse, null, 2));
      setResponseStatus(undefined);
      setResponseHeaders(undefined);
      setElapsedTime(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (request: WorkspaceRequest) => {
    setSelectedRequest(request);
    // Optionnel : charger automatiquement les données de la requête dans le builder
  };

  const handleLoadRequest = (request: WorkspaceRequest) => {
    setSelectedRequest(request);
  };

  const handleDeleteRequest = (requestId: string) => {
    // Supprimer la requête du workspace
    deleteRequest(requestId);
    // Le useEffect se chargera automatiquement de désélectionner si nécessaire
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Globe
                className="w-5 h-5"
                style={{ color: "var(--primary-foreground)" }}
              />
            </div>
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              LazySloth
            </h1>
            <span
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              API Client
            </span>
            <div className="mx-4">
              <WorkspaceSelector
                onOpenModal={() => setIsWorkspaceModalOpen(true)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsVariablesModalOpen(true)}
              className="p-2 rounded-lg transition-all hover:bg-accent relative"
              style={{ color: "var(--muted-foreground)" }}
              title="Manage Variables"
            >
              <Variable className="w-5 h-5" />
              {currentWorkspace?.variables.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {currentWorkspace.variables.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:bg-accent"
              style={{ color: "var(--muted-foreground)" }}
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              className="p-2 rounded-lg transition-all hover:bg-accent"
              style={{ color: "var(--muted-foreground)" }}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar - seulement visible s'il y a des requêtes */}
        {hasRequests && (
          <aside
            className="w-64 p-4 border-r flex flex-col transition-all duration-300"
            style={{
              backgroundColor: "var(--sidebar)",
              borderColor: "var(--sidebar-border)",
            }}
          >
            {/* Requests list */}
            <div className="flex-1 overflow-hidden">
              <SavedRequestsList 
                onLoadRequest={handleLoadRequest}
                onSelectRequest={handleSelectRequest}
                onDeleteRequest={handleDeleteRequest}
                selectedRequest={selectedRequest}
              />
            </div>
          </aside>
        )}

        {/* Main Panel */}
        <main className="flex-1 flex flex-col transition-all duration-300">
          {selectedRequest ? (
            <>
              <RequestBuilder
                onSendRequest={handleSendRequest}
                isLoading={isLoading}
                onLoadRequest={handleLoadRequest}
                selectedRequest={selectedRequest}
              />
              <ResponseViewer
                response={response}
                status={responseStatus}
                headers={responseHeaders}
                elapsedTime={elapsedTime}
                isLoading={isLoading}
              />
            </>
          ) : hasRequests ? (
            <SelectRequestState 
              onCreateRequest={handleSelectRequest}
            />
          ) : (
            <EmptyRequestState 
              onCreateRequest={handleSelectRequest}
            />
          )}
        </main>
      </div>

      {/* Workspace Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
      
      {/* Variables Modal */}
      <VariablesModal
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}

export default App;
