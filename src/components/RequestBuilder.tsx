import { useState, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { WorkspaceRequest } from "../types/workspace";

interface RequestBuilderProps {
  onSendRequest: (
    method: string,
    url: string,
    headers: string,
    body: string
  ) => void;
  isLoading: boolean;
  onLoadRequest?: (request: WorkspaceRequest) => void;
  selectedRequest?: WorkspaceRequest | null;
}

export function RequestBuilder({
  onSendRequest,
  isLoading,
  onLoadRequest,
  selectedRequest,
}: RequestBuilderProps) {
  const { saveRequest, updateRequest } = useWorkspace();
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState("headers");

  // Charger les données de la requête sélectionnée
  useEffect(() => {
    if (selectedRequest) {
      setSelectedMethod(selectedRequest.method);
      setUrl(selectedRequest.url);
      setHeaders(selectedRequest.headers);
      setBody(selectedRequest.body);
    }
  }, [selectedRequest]);

  // Auto-sauvegarder les modifications
  useEffect(() => {
    if (selectedRequest) {
      const timeoutId = setTimeout(() => {
        updateRequest(selectedRequest.id, {
          method: selectedMethod,
          url,
          headers,
          body,
        });
      }, 1000); // Délai de 1 seconde après arrêt de frappe

      return () => clearTimeout(timeoutId);
    }
  }, [selectedMethod, url, headers, body, selectedRequest, updateRequest]);

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateHeaders = (
    headers: string
  ): { valid: boolean; error?: string } => {
    if (!headers.trim()) return { valid: true };

    const lines = headers.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      if (!line.includes(":")) {
        return {
          valid: false,
          error: `Invalid header format: "${line}". Headers must be in "Key: Value" format.`,
        };
      }

      const [key, ...valueParts] = line.split(":");
      if (!key.trim()) {
        return {
          valid: false,
          error: `Header key cannot be empty in: "${line}"`,
        };
      }

      if (valueParts.join(":").trim() === "") {
        return {
          valid: false,
          error: `Header value cannot be empty in: "${line}"`,
        };
      }
    }

    return { valid: true };
  };

  const validateJson = (json: string): { valid: boolean; error?: string } => {
    if (!json.trim()) return { valid: true };

    try {
      JSON.parse(json);
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: `Invalid JSON: ${error.message}` };
    }
  };

  const handleSend = () => {
    const urlTrimmed = url.trim();

    // Validation de l'URL
    if (!urlTrimmed) {
      alert("Please enter a URL for your request");
      return;
    }

    if (!validateUrl(urlTrimmed)) {
      alert("Please enter a valid URL (e.g., https://api.example.com/endpoint)");
      return;
    }

    // Validation des headers
    const headersValidation = validateHeaders(headers);
    if (!headersValidation.valid) {
      alert(`Header validation error: ${headersValidation.error}`);
      return;
    }

    // Validation du JSON body (seulement pour les méthodes qui supportent un body)
    const methodsWithBody = ["POST", "PUT", "PATCH"];
    if (methodsWithBody.includes(selectedMethod) && body.trim()) {
      const jsonValidation = validateJson(body);
      if (!jsonValidation.valid) {
        alert(`Body validation error: ${jsonValidation.error}`);
        return;
      }
    }

    onSendRequest(selectedMethod, urlTrimmed, headers, body);
  };


  const loadRequest = (request: WorkspaceRequest) => {
    setSelectedMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setBody(request.body);
    if (onLoadRequest) {
      onLoadRequest(request);
    }
  };

  return (
    <div
      className="p-6 border-b"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="space-y-4">
        {/* Method and URL */}
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="appearance-none rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{
                backgroundColor: "var(--input)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {httpMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={url ? "" : "Enter your API endpoint URL (e.g., https://api.example.com/users)"}
            className="flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              backgroundColor: "var(--input)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !url.trim()}
            className="px-6 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? "Sending..." : "Send"}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b" style={{ borderColor: "var(--border)" }}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("headers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === "headers"
                  ? "border-transparent"
                  : "border-transparent"
              }`}
              style={{
                color:
                  activeTab === "headers"
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                borderBottomColor:
                  activeTab === "headers" ? "var(--primary)" : "transparent",
              }}
            >
              Headers
            </button>
            <button
              onClick={() => setActiveTab("body")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === "body"
                  ? "border-transparent"
                  : "border-transparent"
              }`}
              style={{
                color:
                  activeTab === "body"
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                borderBottomColor:
                  activeTab === "body" ? "var(--primary)" : "transparent",
              }}
            >
              Body
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === "headers" && (
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder="Content-Type: application/json&#10;Authorization: Bearer your-token&#10;Accept: application/json"
              className="w-full h-48 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
              style={{
                backgroundColor: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          )}
          {activeTab === "body" && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value", "number": 123, "boolean": true}'
              className="w-full h-48 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
              style={{
                backgroundColor: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          )}
        </div>
      </div>

    </div>
  );
}
