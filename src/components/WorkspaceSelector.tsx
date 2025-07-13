import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";

interface WorkspaceSelectorProps {
  onOpenModal: () => void;
}

export function WorkspaceSelector({ onOpenModal }: WorkspaceSelectorProps) {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  const handleWorkspaceSelect = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-accent"
        style={{ color: "var(--foreground)" }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: currentWorkspace?.color || "#3b82f6" }}
        />
        <span className="text-sm font-medium max-w-32 truncate">
          {currentWorkspace?.name || "No workspace"}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-lg border z-20"
            style={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
            }}
          >
            <div className="p-2">
              <div className="mb-2">
                <h4
                  className="text-xs font-medium px-2 py-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Workspaces
                </h4>
              </div>

              {/* Workspace list */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleWorkspaceSelect(workspace.id)}
                    className={`w-full flex items-center space-x-3 px-2 py-2 rounded text-left transition-all hover:bg-accent ${
                      currentWorkspace?.id === workspace.id ? "bg-accent" : ""
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: workspace.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--foreground)" }}
                      >
                        {workspace.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {workspace.requests.length} request
                        {workspace.requests.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div
                className="border-t mt-2 pt-2"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  onClick={() => {
                    onOpenModal();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2 py-2 rounded text-left transition-all hover:bg-accent"
                  style={{ color: "var(--foreground)" }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
