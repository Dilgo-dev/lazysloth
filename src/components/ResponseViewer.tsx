import { Code, Copy, Check, Download, Eye, FileText, AlertCircle, CheckCircle, Clock, XCircle, Server, FileJson, Globe } from "lucide-react";
import { useState, useMemo } from "react";

interface ResponseViewerProps {
  response: string;
  status?: number;
  isLoading: boolean;
  headers?: Record<string, string>;
  elapsedTime?: number;
}

export function ResponseViewer({
  response,
  status,
  isLoading,
  headers,
  elapsedTime,
}: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const statusInfo = useMemo(() => {
    if (!status) return null;
    
    if (status >= 200 && status < 300) {
      return {
        className: 'status-2xx',
        backgroundClass: 'bg-green-100 dark:bg-green-900/20',
        borderClass: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        text: 'Success',
        description: 'Request completed successfully'
      };
    }
    if (status >= 300 && status < 400) {
      return {
        className: 'status-3xx',
        backgroundClass: 'bg-yellow-100 dark:bg-yellow-900/20',
        borderClass: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
        text: 'Redirect',
        description: 'Request redirected'
      };
    }
    if (status >= 400 && status < 500) {
      return {
        className: 'status-4xx',
        backgroundClass: 'bg-orange-100 dark:bg-orange-900/20',
        borderClass: 'border-orange-200 dark:border-orange-800',
        icon: AlertCircle,
        text: 'Client Error',
        description: 'Client-side error occurred'
      };
    }
    if (status >= 500) {
      return {
        className: 'status-5xx',
        backgroundClass: 'bg-red-100 dark:bg-red-900/20',
        borderClass: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        text: 'Server Error',
        description: 'Server-side error occurred'
      };
    }
    return {
      className: 'text-muted-foreground',
      backgroundClass: 'bg-muted',
      borderClass: 'border-border',
      icon: AlertCircle,
      text: 'Unknown',
      description: 'Unknown status'
    };
  }, [status]);

  const responseData = useMemo(() => {
    if (!response) return null;
    
    try {
      const parsed = JSON.parse(response);
      return {
        isJson: true,
        formatted: JSON.stringify(parsed, null, 2),
        raw: response,
        size: new Blob([response]).size,
        isError: parsed.error === true
      };
    } catch {
      return {
        isJson: false,
        formatted: response,
        raw: response,
        size: new Blob([response]).size,
        isError: false
      };
    }
  }, [response]);

  const copyToClipboard = async () => {
    try {
      let textToCopy = '';
      if (activeTab === 'body') {
        textToCopy = viewMode === 'formatted' ? responseData?.formatted || '' : responseData?.raw || '';
      } else {
        textToCopy = headers ? JSON.stringify(headers, null, 2) : '';
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const downloadResponse = () => {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (activeTab === 'body' && responseData) {
      content = viewMode === 'formatted' ? responseData.formatted : responseData.raw;
      filename = `response-body.${responseData.isJson ? 'json' : 'txt'}`;
      mimeType = responseData.isJson ? 'application/json' : 'text/plain';
    } else if (activeTab === 'headers' && headers) {
      content = JSON.stringify(headers, null, 2);
      filename = 'response-headers.json';
      mimeType = 'application/json';
    } else {
      return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="border-b px-6 py-4"
        style={{ 
          backgroundColor: "var(--card)",
          borderColor: "var(--border)" 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: "var(--card-foreground)" }}
            >
              Response
            </h3>
            {responseData && activeTab === 'body' && (
              <span 
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {formatSize(responseData.size)}
              </span>
            )}
            {headers && activeTab === 'headers' && (
              <span 
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {Object.keys(headers).length} headers
              </span>
            )}
            {elapsedTime && (
              <div 
                className="flex items-center space-x-1 text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Clock className="w-4 h-4" />
                <span>{elapsedTime}ms</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {statusInfo && (
              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${statusInfo.backgroundClass} ${statusInfo.borderClass} border`}
                >
                  <statusInfo.icon 
                    className={`w-4 h-4 ${statusInfo.className}`}
                  />
                  <span 
                    className={`text-sm font-medium ${statusInfo.className}`}
                  >
                    {status} {statusInfo.text}
                  </span>
                </div>
              </div>
            )}
            
            {(responseData || headers) && (
              <div className="flex items-center space-x-1">
                {activeTab === 'body' && responseData && (
                  <button
                    onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                    style={{ 
                      color: "var(--muted-foreground)",
                      backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title={`Switch to ${viewMode === 'formatted' ? 'raw' : 'formatted'} view`}
                  >
                    {viewMode === 'formatted' ? <FileText className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{viewMode === 'formatted' ? 'Raw' : 'Formatted'}</span>
                  </button>
                )}
                
                <button
                  onClick={downloadResponse}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    color: "var(--muted-foreground)",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={`Download ${activeTab}`}
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    color: copied ? "var(--primary)" : "var(--muted-foreground)",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    if (!copied) e.currentTarget.style.backgroundColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={`Copy ${activeTab}`}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      {(responseData || headers) && (
        <div 
          className="border-b"
          style={{ 
            backgroundColor: "var(--card)",
            borderColor: "var(--border)" 
          }}
        >
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('body')}
              className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === 'body' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'body' ? 'var(--primary)' : 'var(--muted-foreground)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'body') {
                  e.currentTarget.style.color = 'var(--foreground)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'body') {
                  e.currentTarget.style.color = 'var(--muted-foreground)';
                }
              }}
            >
              <FileJson className="w-4 h-4" />
              <span>Body</span>
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === 'headers' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'headers' ? 'var(--primary)' : 'var(--muted-foreground)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'headers') {
                  e.currentTarget.style.color = 'var(--foreground)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'headers') {
                  e.currentTarget.style.color = 'var(--muted-foreground)';
                }
              }}
            >
              <Server className="w-4 h-4" />
              <span>Headers</span>
            </button>
          </nav>
        </div>
      )}

      <div 
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div 
                  className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{ 
                    borderColor: "var(--muted)",
                    borderTopColor: "var(--primary)"
                  }}
                ></div>
              </div>
              <p 
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Sending request...
              </p>
              <p 
                className="text-xs mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Please wait while we process your request
              </p>
            </div>
          </div>
        ) : (responseData || headers) ? (
          <div className="h-full flex flex-col">
            {responseData?.isError && activeTab === 'body' && (
              <div 
                className="border-l-4 p-4 m-4 rounded-r-lg"
                style={{ 
                  backgroundColor: "var(--destructive)/10",
                  borderColor: "var(--destructive)"
                }}
              >
                <div className="flex items-center">
                  <AlertCircle 
                    className="w-5 h-5 mr-2"
                    style={{ color: "var(--destructive)" }}
                  />
                  <p 
                    className="text-sm font-medium"
                    style={{ color: "var(--destructive)" }}
                  >
                    Error Response Detected
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === 'body' && responseData ? (
                <div 
                  className="rounded-lg border shadow-sm"
                  style={{ 
                    backgroundColor: "var(--card)",
                    borderColor: responseData.isError ? 'var(--destructive)' : 'var(--border)'
                  }}
                >
                  <div className="p-4">
                    <pre
                      className="text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-auto"
                      style={{
                        color: responseData.isError ? 'var(--destructive)' : 'var(--card-foreground)',
                        maxHeight: 'calc(100vh - 300px)'
                      }}
                    >
                      {viewMode === 'formatted' ? responseData.formatted : responseData.raw}
                    </pre>
                  </div>
                </div>
              ) : activeTab === 'headers' && headers ? (
                <div 
                  className="rounded-lg border shadow-sm" 
                  style={{ 
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)" 
                  }}
                >
                  <div className="p-4">
                    <div className="grid gap-3">
                      {Object.entries(headers).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="flex items-start space-x-3 py-2 border-b last:border-b-0"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div className="flex-shrink-0">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: "var(--primary)/10",
                                color: "var(--primary)"
                              }}
                            >
                              {key}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p 
                              className="text-sm font-mono break-all"
                              style={{ color: "var(--card-foreground)" }}
                            >
                              {value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Globe 
                      className="w-12 h-12 mx-auto mb-4" 
                      style={{ color: "var(--muted-foreground)" }}
                    />
                    <p 
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No {activeTab} data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <Code 
                  className="w-10 h-10" 
                  style={{ color: "var(--muted-foreground)" }}
                />
              </div>
              <h4 
                className="text-lg font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                No Response Yet
              </h4>
              <p 
                className="mb-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Send a request to see the response here
              </p>
              <p 
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                The response will be automatically formatted and displayed with syntax highlighting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
