import { useState, useEffect } from "react";
import { Send, ChevronDown, Variable } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { WorkspaceRequest, BodyType } from "../types/workspace";
import { AutocompleteInput } from "./AutocompleteInput";

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
  const { saveRequest, updateRequest, resolveVariables, currentWorkspace } =
    useWorkspace();
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState<BodyType>("json");
  const [activeTab, setActiveTab] = useState("body");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonCorrectionInfo, setJsonCorrectionInfo] = useState<string | null>(
    null
  );

  // Charger les données de la requête sélectionnée
  useEffect(() => {
    if (selectedRequest) {
      setSelectedMethod(selectedRequest.method);
      setUrl(selectedRequest.url);
      setHeaders(selectedRequest.headers);
      setBody(selectedRequest.body);
      setBodyType(selectedRequest.bodyType || "json"); // Migration : défaut à json si bodyType n'existe pas
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
          bodyType,
        });
      }, 1000); // Délai de 1 seconde après arrêt de frappe

      return () => clearTimeout(timeoutId);
    }
  }, [
    selectedMethod,
    url,
    headers,
    body,
    bodyType,
    selectedRequest,
    updateRequest,
  ]);

  // Auto-gestion du Content-Type header quand le bodyType change
  useEffect(() => {
    if (selectedRequest && bodyType) {
      const contentType = bodyTypes.find(
        (t) => t.value === bodyType
      )?.contentType;
      if (contentType) {
        const updatedHeaders = updateContentTypeHeader(headers, contentType);
        if (updatedHeaders !== headers) {
          setHeaders(updatedHeaders);
        }
      }
    }
  }, [bodyType]); // Se déclenche uniquement quand bodyType change

  // Validation JSON temps réel
  useEffect(() => {
    if (bodyType === "json" && body.trim()) {
      const validation = validateJson(body);
      if (!validation.valid) {
        setJsonError(validation.error || "Invalid JSON");
        setJsonCorrectionInfo(null);
      } else {
        setJsonError(null);
        if (validation.corrected) {
          setJsonCorrectionInfo("Auto-corrected: Fixed smart quotes for valid JSON");
        } else {
          setJsonCorrectionInfo(null);
        }
      }
    } else {
      setJsonError(null);
      setJsonCorrectionInfo(null);
    }
  }, [body, bodyType]);

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  const bodyTypes = [
    { value: "json", label: "JSON", contentType: "application/json" },
    { value: "text", label: "Text", contentType: "text/plain" },
    {
      value: "form-urlencoded",
      label: "Form URL Encoded",
      contentType: "application/x-www-form-urlencoded",
    },
    { value: "xml", label: "XML", contentType: "application/xml" },
    {
      value: "form-data",
      label: "Form Data",
      contentType: "multipart/form-data",
    },
  ] as const;

  // Fonction pour mettre à jour automatiquement le Content-Type header
  const updateContentTypeHeader = (
    currentHeaders: string,
    newContentType: string
  ): string => {
    const lines = currentHeaders.split("\n").filter((line) => line.trim());

    // Supprimer l'ancien Content-Type s'il existe (insensible à la casse)
    const filteredLines = lines.filter(
      (line) => !line.toLowerCase().startsWith("content-type:")
    );

    // Ajouter le nouveau Content-Type en première ligne
    filteredLines.unshift(`Content-Type: ${newContentType}`);

    return filteredLines.join("\n");
  };

  // Fonction pour parser les headers du format texte vers JSON
  const parseHeadersToJson = (headersText: string): Record<string, string> => {
    const result: Record<string, string> = {};
    if (!headersText.trim()) return result;

    const lines = headersText.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    }
    return result;
  };

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

  const validateJson = (
    json: string
  ): { valid: boolean; error?: string; corrected?: string } => {
    if (!json.trim()) return { valid: true };

    let contentToValidate = json.trim();

    // Debug: Logger le contenu détaillé
    console.log("🔍 JSON Debug Info:");
    console.log("Raw length:", contentToValidate.length);
    console.log("Raw content:", JSON.stringify(contentToValidate));
    console.log("First 50 chars:", contentToValidate.substring(0, 50));
    console.log(
      "Char codes (first 20):",
      Array.from(contentToValidate.substring(0, 20)).map((c) => c.charCodeAt(0))
    );

    try {
      JSON.parse(contentToValidate);
      console.log("✅ JSON validation passed without correction");
      return { valid: true };
    } catch (error: any) {
      console.log("❌ JSON validation failed:", error.message);

      // Série de tentatives d'auto-correction
      let correctedJson = contentToValidate;
      let correctionApplied = false;
      let correctionType = "";

      // 1. Convertir les guillemets courbes en guillemets droits (PRIORITÉ macOS)
      const curlyQuotePattern = /[""''«»„"]/g;
      if (curlyQuotePattern.test(correctedJson)) {
        correctedJson = correctedJson
          .replace(/[""]/g, '"')  // Guillemets courbes anglais
          .replace(/['']/g, "'")  // Apostrophes courbes
          .replace(/[«»]/g, '"')  // Guillemets français
          .replace(/[„"]/g, '"'); // Guillemets allemands
        correctionApplied = true;
        correctionType = "Fixed smart quotes (macOS)";
        console.log("🔧 Attempted correction: Fix smart quotes");
      }

      // 2. Vérifier si c'est une chaîne JSON sérialisée (double-encodage)
      if (!correctionApplied && correctedJson.startsWith('"') && correctedJson.endsWith('"')) {
        try {
          const decoded = JSON.parse(correctedJson);
          if (typeof decoded === "string") {
            correctedJson = decoded;
            correctionApplied = true;
            correctionType = "Removed double-encoding";
            console.log("🔧 Attempted correction: Remove double-encoding");
          }
        } catch {}
      }

      // 3. Convertir les guillemets simples en doubles
      if (
        error.message.includes("Unrecognized token '''") ||
        error.message.includes("Unexpected token '''")
      ) {
        correctedJson = correctedJson.replace(/'/g, '"');
        correctionApplied = true;
        correctionType = "Converted single quotes to double quotes";
        console.log("🔧 Attempted correction: Convert single to double quotes");
      }

      // 4. Supprimer les échappements incorrects
      if (correctedJson.includes('\\"')) {
        const unescaped = correctedJson.replace(/\\"/g, '"');
        if (unescaped !== correctedJson) {
          correctedJson = unescaped;
          correctionApplied = true;
          correctionType = "Removed incorrect escaping";
          console.log("🔧 Attempted correction: Remove incorrect escaping");
        }
      }

      // Tester si la correction fonctionne
      if (correctionApplied) {
        try {
          JSON.parse(correctedJson);
          console.log("✅ Auto-correction successful:", correctionType);
          return {
            valid: true,
            corrected: correctedJson,
          };
        } catch (correctionError: any) {
          console.log("❌ Auto-correction failed:", correctionError.message);
        }
      }

      // Extraire des informations utiles de l'erreur
      let errorMessage = error.message;

      // Messages d'erreur plus spécifiques
      if (errorMessage.includes("Unrecognized token '\"'")) {
        errorMessage =
          'Problem with quotes. On macOS, try disabling "Smart Quotes" or use straight quotes (").';
      } else if (errorMessage.includes("Unrecognized token '''")) {
        errorMessage =
          'JSON requires double quotes (") not single quotes (\'). Use: {"key": "value"}';
      } else if (errorMessage.includes("Unexpected token")) {
        errorMessage =
          "Invalid JSON syntax. Check for missing quotes, commas, or brackets.";
      } else if (errorMessage.includes("Unexpected end of JSON input")) {
        errorMessage =
          "Incomplete JSON. Make sure all brackets and quotes are closed.";
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }
  };

  const handleSend = () => {
    // Réinitialiser les erreurs
    setValidationError(null);

    const urlTrimmed = url.trim();

    // Validation de l'URL
    if (!urlTrimmed) {
      setValidationError("Please enter a URL for your request");
      return;
    }

    // Résoudre les variables avant validation
    const resolvedUrl = resolveVariables(urlTrimmed);
    const resolvedHeaders = resolveVariables(headers);
    const resolvedBody = resolveVariables(body);

    if (!validateUrl(resolvedUrl)) {
      setValidationError(
        "Please enter a valid URL (e.g., https://api.example.com/endpoint)"
      );
      return;
    }

    // Validation des headers
    const headersValidation = validateHeaders(resolvedHeaders);
    if (!headersValidation.valid) {
      setValidationError(`Header validation error: ${headersValidation.error}`);
      return;
    }

    // Validation du JSON body (seulement pour les méthodes qui supportent un body)
    const methodsWithBody = ["POST", "PUT", "PATCH"];
    if (methodsWithBody.includes(selectedMethod) && resolvedBody.trim()) {
      // Validation JSON seulement si le bodyType est JSON
      if (bodyType === "json") {
        const jsonValidation = validateJson(resolvedBody);
        if (!jsonValidation.valid) {
          setValidationError(`JSON validation error: ${jsonValidation.error}`);
          return;
        }
        // Si une correction a été appliquée, utiliser le JSON corrigé
        if (jsonValidation.corrected) {
          resolvedBody = jsonValidation.corrected;
          console.log("🔧 Applied JSON auto-correction for request");
        }
      }
      // Pour les autres types de body (text, form-urlencoded, etc.), pas de validation JSON
    }

    // Parser les headers au format JSON pour le backend
    const headersJson = JSON.stringify(parseHeadersToJson(resolvedHeaders));

    // Debug: Logger les détails de la requête
    console.log("🚀 Sending request:", {
      method: selectedMethod,
      url: resolvedUrl,
      headers: headersJson,
      body: resolvedBody,
      bodyType: bodyType,
    });

    // Envoyer la requête avec les variables résolues
    onSendRequest(selectedMethod, resolvedUrl, headersJson, resolvedBody);
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
          <AutocompleteInput
            value={url}
            onChange={setUrl}
            placeholder={
              url
                ? ""
                : "Enter your API endpoint URL (e.g., https://api.example.com/users) - Press Enter to send"
            }
            className="rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              backgroundColor: "var(--input)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            variables={currentWorkspace?.variables || []}
            onEnterPress={handleSend}
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
            <button
              onClick={() => setActiveTab("variables")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all flex items-center space-x-1 ${
                activeTab === "variables"
                  ? "border-transparent"
                  : "border-transparent"
              }`}
              style={{
                color:
                  activeTab === "variables"
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                borderBottomColor:
                  activeTab === "variables" ? "var(--primary)" : "transparent",
              }}
            >
              <Variable className="w-4 h-4" />
              <span>Variables</span>
            </button>
          </nav>
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <div
            className="p-3 rounded-lg border-l-4 mb-4"
            style={{
              backgroundColor: "#fee2e2",
              borderLeftColor: "#dc2626",
              color: "#b91c1c",
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">⚠️ Validation Error:</span>
              <span>{validationError}</span>
            </div>
          </div>
        )}

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
            <div className="space-y-4">
              {/* Body Type Selector */}
              <div className="flex items-center space-x-3">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Body Type:
                </label>
                <div className="relative">
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value as BodyType)}
                    className="appearance-none rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                    style={{
                      backgroundColor: "var(--input)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    {bodyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </div>
              </div>

              {/* Body Content */}
              {bodyType === "json" && (
                <div className="space-y-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{\n  "key": "value",\n  "number": 123,\n  "boolean": true\n}'
                    className="w-full h-40 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
                    style={{
                      backgroundColor: "var(--muted)",
                      border: jsonError
                        ? "1px solid #dc2626"
                        : "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    // Désactiver les smart quotes macOS
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    autoComplete="off"
                  />
                  {jsonError && (
                    <div
                      className="text-sm p-2 rounded"
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                      }}
                    >
                      {jsonError}
                    </div>
                  )}
                  {jsonCorrectionInfo && (
                    <div
                      className="text-sm p-2 rounded"
                      style={{
                        backgroundColor: "#d1fae5",
                        color: "#065f46",
                      }}
                    >
                      ✅ {jsonCorrectionInfo}
                    </div>
                  )}
                </div>
              )}

              {bodyType === "text" && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter your plain text content here..."
                  className="w-full h-40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
                  style={{
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              )}

              {bodyType === "xml" && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <element>value</element>\n</root>'
                  className="w-full h-40 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
                  style={{
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              )}

              {bodyType === "form-urlencoded" && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="key1=value1&key2=value2&key3=value3"
                  className="w-full h-40 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
                  style={{
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              )}

              {bodyType === "form-data" && (
                <div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Use multipart form data format or raw content"
                    className="w-full h-40 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none custom-scrollbar transition-all"
                    style={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Note: Form data editor will be enhanced in future versions
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === "variables" && (
            <div className="min-h-[200px] p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h4
                    className="text-lg font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Variable Preview
                  </h4>
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    See how your request will look with variables resolved:
                  </p>
                </div>

                {/* URL Preview */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    URL Preview:
                  </label>
                  <div
                    className="p-3 rounded-lg font-mono text-sm break-all"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    {url ? resolveVariables(url) : "Enter a URL to see preview"}
                  </div>
                </div>

                {/* Headers Preview */}
                {headers.trim() && (
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      Headers Preview:
                    </label>
                    <pre
                      className="p-3 rounded-lg font-mono text-sm whitespace-pre-wrap"
                      style={{
                        backgroundColor: "var(--muted)",
                        color: "var(--foreground)",
                      }}
                    >
                      {resolveVariables(headers)}
                    </pre>
                  </div>
                )}

                {/* Body Preview */}
                {body.trim() && (
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      Body Preview:
                    </label>
                    <pre
                      className="p-3 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-32 overflow-y-auto"
                      style={{
                        backgroundColor: "var(--muted)",
                        color: "var(--foreground)",
                      }}
                    >
                      {resolveVariables(body)}
                    </pre>
                  </div>
                )}

                {/* Available Variables */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Available Variables:
                  </label>
                  <div className="space-y-2">
                    {currentWorkspace?.variables.length > 0 ? (
                      currentWorkspace.variables.map((variable) => (
                        <div
                          key={variable.id}
                          className="flex items-center justify-between p-2 rounded"
                          style={{ backgroundColor: "var(--card)" }}
                        >
                          <span
                            className="font-mono text-sm"
                            style={{ color: "var(--primary)" }}
                          >
                            {variable.name}
                          </span>
                          <span
                            className="text-sm truncate ml-2"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {variable.value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p
                        className="text-sm text-center py-4"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        No variables defined. Create variables in the sidebar to
                        use them in your requests.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
