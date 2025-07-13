import { useState, useEffect } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import {
  WORKSPACE_COLORS,
  Workspace,
  WorkspaceColor,
} from "../types/workspace";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWorkspace?: Workspace | null;
}

export function WorkspaceModal({
  isOpen,
  onClose,
  editingWorkspace,
}: WorkspaceModalProps) {
  const { createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<WorkspaceColor>(
    WORKSPACE_COLORS[0]
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingWorkspace) {
      setName(editingWorkspace.name);
      setSelectedColor(
        WORKSPACE_COLORS.includes(editingWorkspace.color as WorkspaceColor)
          ? (editingWorkspace.color as WorkspaceColor)
          : WORKSPACE_COLORS[0]
      );
    } else {
      setName("");
      setSelectedColor(WORKSPACE_COLORS[0]);
    }
    setShowDeleteConfirm(false);
  }, [editingWorkspace, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingWorkspace) {
      updateWorkspace(editingWorkspace.id, {
        name: name.trim(),
        color: selectedColor,
      });
    } else {
      createWorkspace(name.trim(), selectedColor);
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingWorkspace) {
      deleteWorkspace(editingWorkspace.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="w-full max-w-md rounded-lg shadow-xl"
          style={{ backgroundColor: "var(--card)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {editingWorkspace ? "Edit Workspace" : "New Workspace"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-accent transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name input */}
            <div>
              <label
                htmlFor="workspace-name"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{
                  backgroundColor: "var(--input)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                autoFocus
              />
            </div>

            {/* Color picker */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        selectedColor === color ? "var(--ring)" : "transparent",
                    }}
                  >
                    {selectedColor === color && (
                      <Check className="w-4 h-4" style={{ color: "white" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {name || "Workspace Name"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div>
                {editingWorkspace && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-destructive/10 flex items-center space-x-2"
                    style={{ color: "var(--destructive)" }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                {showDeleteConfirm && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {editingWorkspace ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
