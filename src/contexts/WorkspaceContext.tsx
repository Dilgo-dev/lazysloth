import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Workspace, WorkspaceRequest, WorkspaceVariable, WORKSPACE_COLORS } from "../types/workspace";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  createWorkspace: (name: string, color: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  setCurrentWorkspace: (workspaceId: string) => void;
  saveRequest: (request: Omit<WorkspaceRequest, 'id' | 'createdAt' | 'lastUsed'>) => string;
  deleteRequest: (requestId: string) => void;
  updateRequest: (requestId: string, updates: Partial<WorkspaceRequest>) => void;
  loadRequest: (requestId: string) => WorkspaceRequest | null;
  createVariable: (name: string, value: string, description?: string) => string;
  updateVariable: (id: string, updates: Partial<WorkspaceVariable>) => void;
  deleteVariable: (id: string) => void;
  resolveVariables: (text: string) => string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'luabeam_workspaces';
const CURRENT_WORKSPACE_KEY = 'luabeam_current_workspace';

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);

  // Load workspaces from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentId = localStorage.getItem(CURRENT_WORKSPACE_KEY);
    
    if (stored) {
      try {
        const parsedWorkspaces = JSON.parse(stored).map((ws: any) => ({
          ...ws,
          createdAt: new Date(ws.createdAt),
          requests: ws.requests.map((req: any) => ({
            ...req,
            createdAt: new Date(req.createdAt),
            lastUsed: new Date(req.lastUsed),
          })),
          // Migration: ajouter variables si elles n'existent pas
          variables: ws.variables ? ws.variables.map((variable: any) => ({
            ...variable,
            createdAt: new Date(variable.createdAt),
          })) : [],
        }));
        
        setWorkspaces(parsedWorkspaces);
        
        if (currentId) {
          const current = parsedWorkspaces.find((ws: Workspace) => ws.id === currentId);
          if (current) {
            setCurrentWorkspaceState(current);
          } else if (parsedWorkspaces.length > 0) {
            setCurrentWorkspaceState(parsedWorkspaces[0]);
          }
        } else if (parsedWorkspaces.length > 0) {
          setCurrentWorkspaceState(parsedWorkspaces[0]);
        }
      } catch (error) {
        console.error('Failed to parse workspaces from localStorage:', error);
        createDefaultWorkspace();
      }
    } else {
      createDefaultWorkspace();
    }
  }, []);

  // Save workspaces to localStorage whenever they change
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    }
  }, [workspaces]);

  // Save current workspace to localStorage whenever it changes
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem(CURRENT_WORKSPACE_KEY, currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const createDefaultWorkspace = () => {
    const defaultWorkspace: Workspace = {
      id: 'default',
      name: 'Default Workspace',
      color: WORKSPACE_COLORS[0],
      createdAt: new Date(),
      requests: [],
      variables: [],
    };
    setWorkspaces([defaultWorkspace]);
    setCurrentWorkspaceState(defaultWorkspace);
  };

  const createWorkspace = (name: string, color: string) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date(),
      requests: [],
      variables: [],
    };
    
    setWorkspaces(prev => [...prev, newWorkspace]);
    setCurrentWorkspaceState(newWorkspace);
  };

  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => {
      const filtered = prev.filter(ws => ws.id !== workspaceId);
      
      // If we're deleting the current workspace, switch to the first available one
      if (currentWorkspace?.id === workspaceId && filtered.length > 0) {
        setCurrentWorkspaceState(filtered[0]);
      } else if (filtered.length === 0) {
        createDefaultWorkspace();
      }
      
      return filtered;
    });
  };

  const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspaceId ? { ...ws, ...updates } : ws
    ));
    
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspaceState(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const setCurrentWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceState(workspace);
    }
  };

  const saveRequest = (request: Omit<WorkspaceRequest, 'id' | 'createdAt' | 'lastUsed'>): string => {
    if (!currentWorkspace) return "";

    const newRequest: WorkspaceRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    const updatedWorkspace = {
      ...currentWorkspace,
      requests: [...currentWorkspace.requests, newRequest],
    };

    updateWorkspace(currentWorkspace.id, updatedWorkspace);
    return newRequest.id;
  };

  const deleteRequest = (requestId: string) => {
    if (!currentWorkspace) return;

    const updatedWorkspace = {
      ...currentWorkspace,
      requests: currentWorkspace.requests.filter(req => req.id !== requestId),
    };

    updateWorkspace(currentWorkspace.id, updatedWorkspace);
  };

  const updateRequest = (requestId: string, updates: Partial<WorkspaceRequest>) => {
    if (!currentWorkspace) return;

    const updatedWorkspace = {
      ...currentWorkspace,
      requests: currentWorkspace.requests.map(req =>
        req.id === requestId ? { ...req, ...updates } : req
      ),
    };

    updateWorkspace(currentWorkspace.id, updatedWorkspace);
  };

  const loadRequest = (requestId: string): WorkspaceRequest | null => {
    if (!currentWorkspace) return null;
    
    const request = currentWorkspace.requests.find(req => req.id === requestId);
    if (request) {
      // Update lastUsed when loading a request
      updateRequest(requestId, { lastUsed: new Date() });
      return request;
    }
    return null;
  };

  const createVariable = (name: string, value: string, description?: string): string => {
    if (!currentWorkspace) return "";

    const newVariable: WorkspaceVariable = {
      id: Date.now().toString(),
      name: name.toUpperCase(), // Forcer les noms de variables en majuscules
      value,
      description,
      createdAt: new Date(),
    };

    const updatedWorkspace = {
      ...currentWorkspace,
      variables: [...currentWorkspace.variables, newVariable],
    };

    updateWorkspace(currentWorkspace.id, updatedWorkspace);
    return newVariable.id;
  };

  const updateVariable = (id: string, updates: Partial<WorkspaceVariable>) => {
    if (!currentWorkspace) return;

    const updatedWorkspace = {
      ...currentWorkspace,
      variables: currentWorkspace.variables.map(variable =>
        variable.id === id ? { ...variable, ...updates } : variable
      ),
    };

    updateWorkspace(currentWorkspace.id, updatedWorkspace);
  };

  const deleteVariable = (id: string) => {
    if (!currentWorkspace) return;

    const updatedWorkspace = {
      ...currentWorkspace,
      variables: currentWorkspace.variables.filter(variable => variable.id !== id),
    };

    updateWorkspace(currentWorkspace.id, updatedWorkspace);
  };

  const resolveVariables = (text: string): string => {
    if (!currentWorkspace || !text) return text;

    let resolvedText = text;
    
    // Remplacer chaque variable par sa valeur
    currentWorkspace.variables.forEach(variable => {
      // Utilisation d'une regex pour matcher exactement le nom de la variable (mot entier)
      const regex = new RegExp(`\\b${variable.name}\\b`, 'g');
      resolvedText = resolvedText.replace(regex, variable.value);
    });

    return resolvedText;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        createWorkspace,
        deleteWorkspace,
        updateWorkspace,
        setCurrentWorkspace,
        saveRequest,
        deleteRequest,
        updateRequest,
        loadRequest,
        createVariable,
        updateVariable,
        deleteVariable,
        resolveVariables,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}