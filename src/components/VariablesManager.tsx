import { useState } from "react";
import { Variable, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { WorkspaceVariable } from "../types/workspace";

export function VariablesManager() {
  const { currentWorkspace, createVariable, updateVariable, deleteVariable } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState({ name: "", value: "", description: "" });
  const [editVariable, setEditVariable] = useState({ name: "", value: "", description: "" });

  const variables = currentWorkspace?.variables || [];

  const handleCreateVariable = () => {
    if (!newVariable.name.trim() || !newVariable.value.trim()) return;

    createVariable(
      newVariable.name.trim(),
      newVariable.value.trim(),
      newVariable.description.trim() || undefined
    );

    setNewVariable({ name: "", value: "", description: "" });
    setIsCreating(false);
  };

  const handleEditVariable = (variable: WorkspaceVariable) => {
    setEditingId(variable.id);
    setEditVariable({
      name: variable.name,
      value: variable.value,
      description: variable.description || "",
    });
  };

  const handleUpdateVariable = () => {
    if (!editVariable.name.trim() || !editVariable.value.trim() || !editingId) return;

    updateVariable(editingId, {
      name: editVariable.name.trim().toUpperCase(),
      value: editVariable.value.trim(),
      description: editVariable.description.trim() || undefined,
    });

    setEditingId(null);
    setEditVariable({ name: "", value: "", description: "" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditVariable({ name: "", value: "", description: "" });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewVariable({ name: "", value: "", description: "" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Variable className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <h3 className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Variables
          </h3>
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: "var(--muted)", 
              color: "var(--muted-foreground)" 
            }}
          >
            {variables.length}
          </span>
        </div>
      </div>

      {/* Add Variable Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          style={{
            backgroundColor: "var(--muted)",
            color: "var(--foreground)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--muted)";
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Variable</span>
        </button>
      )}

      {/* Create Variable Form */}
      {isCreating && (
        <div 
          className="p-3 rounded-lg border space-y-3"
          style={{ 
            backgroundColor: "var(--card)", 
            borderColor: "var(--border)" 
          }}
        >
          <input
            type="text"
            value={newVariable.name}
            onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
            placeholder="VARIABLE_NAME"
            className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            autoFocus
          />
          <input
            type="text"
            value={newVariable.value}
            onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Variable value"
            className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <input
            type="text"
            value={newVariable.description}
            onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleCreateVariable}
              disabled={!newVariable.name.trim() || !newVariable.value.trim()}
              className="flex items-center space-x-1 px-2 py-1 rounded text-sm disabled:opacity-50"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)"
              }}
            >
              <Check className="w-3 h-3" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancelCreate}
              className="flex items-center space-x-1 px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)"
              }}
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Variables List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {variables.length > 0 ? (
          variables.map((variable) => (
            <div
              key={variable.id}
              className="group p-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: "var(--muted)",
                borderColor: "var(--border)"
              }}
            >
              {editingId === variable.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editVariable.name}
                    onChange={(e) => setEditVariable(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                    className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <input
                    type="text"
                    value={editVariable.value}
                    onChange={(e) => setEditVariable(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <input
                    type="text"
                    value={editVariable.description}
                    onChange={(e) => setEditVariable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateVariable}
                      disabled={!editVariable.name.trim() || !editVariable.value.trim()}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-sm disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)"
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-sm"
                      style={{
                        backgroundColor: "var(--muted)",
                        color: "var(--muted-foreground)"
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span 
                        className="text-sm font-mono font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        {variable.name}
                      </span>
                    </div>
                    <div 
                      className="text-sm truncate mb-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {variable.value}
                    </div>
                    {variable.description && (
                      <div 
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {variable.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditVariable(variable)}
                      className="p-1 rounded hover:bg-accent transition-colors"
                      style={{ color: "var(--muted-foreground)" }}
                      title="Edit variable"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteVariable(variable.id)}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors"
                      style={{ color: "var(--destructive)" }}
                      title="Delete variable"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Variable className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              No variables yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Create variables to reuse values in your requests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}