import { useState } from "react";
import { Star, Play, Trash2, Edit, Search, Plus } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { WorkspaceRequest } from "../types/workspace";

interface SavedRequestsListProps {
  onLoadRequest: (request: WorkspaceRequest) => void;
  onSelectRequest: (request: WorkspaceRequest) => void;
  selectedRequest: WorkspaceRequest | null;
}

export function SavedRequestsList({ onLoadRequest, onSelectRequest, selectedRequest }: SavedRequestsListProps) {
  const { currentWorkspace, deleteRequest, updateRequest, saveRequest } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const filteredRequests = currentWorkspace?.requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.method.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const methodColors = {
    GET: { backgroundColor: "var(--chart-1)", color: "white" },
    POST: { backgroundColor: "var(--chart-2)", color: "white" },
    PUT: { backgroundColor: "var(--chart-3)", color: "white" },
    DELETE: { backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" },
    PATCH: { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" },
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleEdit = (request: WorkspaceRequest) => {
    setEditingId(request.id);
    setEditName(request.name);
  };

  const handleSaveEdit = (requestId: string) => {
    if (editName.trim()) {
      updateRequest(requestId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleLoad = (request: WorkspaceRequest) => {
    onLoadRequest(request);
    onSelectRequest(request);
    updateRequest(request.id, { lastUsed: new Date() });
  };

  const handleSelect = (request: WorkspaceRequest) => {
    onSelectRequest(request);
  };

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
        onSelectRequest(newRequest);
        onLoadRequest(newRequest);
      }
    } catch (error) {
      console.error("Failed to create new request:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with New Request button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
            <h3 className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Requests
            </h3>
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: "var(--muted)", 
                color: "var(--muted-foreground)" 
              }}
            >
              {filteredRequests.length}
            </span>
          </div>
        </div>
        
        {/* New Request Button */}
        <button
          onClick={handleCreateNewRequest}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Search */}
      {currentWorkspace && currentWorkspace.requests.length > 0 && (
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
            style={{ color: "var(--muted-foreground)" }} 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              backgroundColor: "var(--input)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
      )}

      {/* Requests list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredRequests.length > 0 ? (
          filteredRequests
            .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
            .map((request) => (
              <div
                key={request.id}
                className="group p-3 rounded-lg border transition-all hover:bg-accent cursor-pointer"
                style={{
                  backgroundColor: selectedRequest?.id === request.id ? "var(--accent)" : "var(--muted)",
                  borderColor: selectedRequest?.id === request.id ? "var(--primary)" : "var(--border)",
                  borderWidth: selectedRequest?.id === request.id ? "2px" : "1px"
                }}
                onClick={() => handleSelect(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Request name */}
                    <div className="flex items-center space-x-2 mb-2">
                      {editingId === request.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(request.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 px-2 py-1 text-sm rounded focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            color: "var(--foreground)",
                          }}
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--foreground)" }}
                        >
                          {request.name}
                        </h4>
                      )}
                    </div>

                    {/* Method and URL */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={methodColors[request.method as keyof typeof methodColors]}
                      >
                        {request.method}
                      </span>
                      <span
                        className="text-xs truncate"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {request.url}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--muted-foreground)" }}>
                        Last used: {formatDate(request.lastUsed)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === request.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(request.id)}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          style={{ color: "var(--foreground)" }}
                          title="Save"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          style={{ color: "var(--muted-foreground)" }}
                          title="Cancel"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleLoad(request)}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          style={{ color: "var(--foreground)" }}
                          title="Load request"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(request)}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          style={{ color: "var(--muted-foreground)" }}
                          title="Edit name"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="p-1 rounded hover:bg-destructive/10 transition-colors"
                          style={{ color: "var(--destructive)" }}
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-8">
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {searchTerm ? "No requests match your search" : "No requests yet"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {searchTerm ? "Try a different search term" : "Create your first request to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateNewRequest}
                className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)"
                }}
              >
                Create Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}