import { X } from "lucide-react";
import { VariablesManager } from "./VariablesManager";

interface VariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VariablesModal({ isOpen, onClose }: VariablesModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="w-full max-w-2xl max-h-[80vh] rounded-lg shadow-xl overflow-hidden"
          style={{ backgroundColor: "var(--card)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Workspace Variables
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Create and manage variables to reuse in your API requests
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:bg-accent"
              style={{ color: "var(--muted-foreground)" }}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            <div className="space-y-4">
              {/* Instructions */}
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <h3 
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  How to use variables:
                </h3>
                <ul 
                  className="text-sm space-y-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <li>• Create variables with UPPERCASE names (e.g., BASE_URL, API_KEY)</li>
                  <li>• Use them directly in your requests: <code className="bg-black/10 px-1 rounded">BASE_URL/api/users</code></li>
                  <li>• Variables are automatically replaced when sending requests</li>
                  <li>• Use the Variables tab in request builder to preview resolved values</li>
                </ul>
              </div>
              
              {/* Variables Manager */}
              <VariablesManager />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}