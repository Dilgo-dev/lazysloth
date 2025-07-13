import { Globe, Plus } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { WorkspaceRequest } from "../types/workspace";

interface EmptyRequestStateProps {
  onCreateRequest: (request: WorkspaceRequest) => void;
}

export function EmptyRequestState({ onCreateRequest }: EmptyRequestStateProps) {
  const { currentWorkspace, saveRequest } = useWorkspace();

  const handleCreateNewRequest = async () => {
    try {
      // Créer une requête vide avec un nom par défaut
      const requestCount = currentWorkspace?.requests.length || 0;
      const defaultName = `New Request ${requestCount + 1}`;
      
      const requestId = await saveRequest({
        name: defaultName,
        method: "GET",
        url: "",
        headers: "",
        body: "",
        bodyType: "json",
      });
      
      // Récupérer la requête créée et la sélectionner
      const newRequest = currentWorkspace?.requests.find(r => r.id === requestId);
      if (newRequest) {
        onCreateRequest(newRequest);
      }
    } catch (error) {
      console.error("Failed to create new request:", error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-lg">
        <div 
          className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--muted)" }}
        >
          <Globe 
            className="w-12 h-12" 
            style={{ color: "var(--muted-foreground)" }}
          />
        </div>
        
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Welcome to LazySloth
        </h1>
        
        <p 
          className="text-lg mb-8"
          style={{ color: "var(--muted-foreground)" }}
        >
          Your modern API testing companion. Create your first request to get started.
        </p>
        
        <button
          onClick={handleCreateNewRequest}
          className="inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)"
          }}
        >
          <Plus className="w-6 h-6" />
          <span>Create Your First Request</span>
        </button>
        
        <div className="mt-8 space-y-2">
          <p 
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Once created, you can configure the HTTP method, URL, headers, and body
          </p>
          <p 
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            All your requests are automatically saved and organized
          </p>
        </div>
      </div>
    </div>
  );
}