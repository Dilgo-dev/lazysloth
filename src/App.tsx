import { useState, useEffect } from "react";
import { Settings, Globe, Moon, Sun } from "lucide-react";
import { RequestBuilder } from "./components/RequestBuilder";
import { RequestHistory } from "./components/RequestHistory";
import { ResponseViewer } from "./components/ResponseViewer";
import { WorkspaceSelector } from "./components/WorkspaceSelector";
import { WorkspaceModal } from "./components/WorkspaceModal";
import { SavedRequestsList } from "./components/SavedRequestsList";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { invoke } from "@tauri-apps/api/core";
import { RequestHistoryItem, WorkspaceRequest } from "./types/workspace";
import "./App.css";

function App() {
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | undefined>(
    undefined
  );
  const [responseHeaders, setResponseHeaders] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [elapsedTime, setElapsedTime] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"saved" | "history">("saved");

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

      // Ajouter à l'historique
      const newHistoryItem: RequestHistoryItem = {
        id: Date.now().toString(),
        method: method,
        url: url,
        timestamp: new Date(),
        status: httpResponse.status,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
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

      // Ajouter l'erreur à l'historique
      const newHistoryItem: RequestHistoryItem = {
        id: Date.now().toString(),
        method: method,
        url: url,
        timestamp: new Date(),
        status: undefined,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (method: string, url: string) => {
    // Cette fonction sera utilisée pour charger une requête depuis l'historique
    console.log("Selected request:", { method, url });
  };

  const handleLoadRequest = (request: WorkspaceRequest) => {
    console.log("Loading request:", request);
  };

  return (
    <WorkspaceProvider>
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
          {/* Sidebar */}
          <aside
            className="w-64 p-4 border-r flex flex-col"
            style={{
              backgroundColor: "var(--sidebar)",
              borderColor: "var(--sidebar-border)",
            }}
          >
            {/* Tab selector */}
            <div className="mb-4">
              <div
                className="flex rounded-lg p-1"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === "saved" ? "shadow-sm" : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "saved"
                        ? "var(--background)"
                        : "transparent",
                    color:
                      activeTab === "saved"
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                  }}
                >
                  Saved
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === "history" ? "shadow-sm" : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "history"
                        ? "var(--background)"
                        : "transparent",
                    color:
                      activeTab === "history"
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                  }}
                >
                  History
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "saved" ? (
                <SavedRequestsList onLoadRequest={handleLoadRequest} />
              ) : (
                <RequestHistory
                  history={history}
                  onSelectRequest={handleSelectRequest}
                />
              )}
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-1 flex flex-col">
            <RequestBuilder
              onSendRequest={handleSendRequest}
              isLoading={isLoading}
              onLoadRequest={handleLoadRequest}
            />
            <ResponseViewer
              response={response}
              status={responseStatus}
              headers={responseHeaders}
              elapsedTime={elapsedTime}
              isLoading={isLoading}
            />
          </main>
        </div>

        {/* Workspace Modal */}
        <WorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
        />
      </div>
    </WorkspaceProvider>
  );
}

export default App;
