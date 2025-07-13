import { MousePointer, Plus, ArrowLeft } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { WorkspaceRequest } from "../types/workspace";

interface SelectRequestStateProps {
  onCreateRequest: (request: WorkspaceRequest) => void;
}

export function SelectRequestState({ onCreateRequest }: SelectRequestStateProps) {
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
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--muted)" }}
        >
          <MousePointer 
            className="w-10 h-10" 
            style={{ color: "var(--muted-foreground)" }}
          />
        </div>
        
        <h2 
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Select a Request
        </h2>
        
        <p 
          className="text-base mb-6"
          style={{ color: "var(--muted-foreground)" }}
        >
          Choose a request from the sidebar to start testing your API, or create a new one.
        </p>
        
        {/* Indication visuelle vers la sidebar */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <ArrowLeft 
            className="w-5 h-5" 
            style={{ color: "var(--primary)" }}
          />
          <span 
            className="text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            Browse your saved requests
          </span>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleCreateNewRequest}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)"
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Create New Request</span>
          </button>
          
          <p 
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Or click on any request in the sidebar to load it
          </p>
        </div>
      </div>
    </div>
  );
}