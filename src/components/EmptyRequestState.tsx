import { Globe, Plus } from "lucide-react";

export function EmptyRequestState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--muted)" }}
        >
          <Globe 
            className="w-10 h-10" 
            style={{ color: "var(--muted-foreground)" }}
          />
        </div>
        
        <h4 
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--foreground)" }}
        >
          No Request Selected
        </h4>
        
        <p 
          className="mb-4"
          style={{ color: "var(--muted-foreground)" }}
        >
          Select a request from the sidebar to get started
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Plus className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span style={{ color: "var(--muted-foreground)" }}>
              Click "New Request" in the sidebar to create your first request
            </span>
          </div>
          
          <p 
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            You can then fill in the URL, method, headers, and body to test your API
          </p>
        </div>
      </div>
    </div>
  );
}