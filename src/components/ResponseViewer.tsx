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
        color: '#22c55e',
        backgroundColor: '#dcfce7',
        textColor: '#15803d',
        icon: CheckCircle,
        text: 'Success',
        description: 'Request completed successfully'
      };
    }
    if (status >= 300 && status < 400) {
      return {
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        textColor: '#d97706',
        icon: Clock,
        text: 'Redirect',
        description: 'Request redirected'
      };
    }
    if (status >= 400 && status < 500) {
      return {
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        textColor: '#dc2626',
        icon: AlertCircle,
        text: 'Client Error',
        description: 'Client-side error occurred'
      };
    }
    if (status >= 500) {
      return {
        color: '#dc2626',
        backgroundColor: '#fecaca',
        textColor: '#991b1b',
        icon: XCircle,
        text: 'Server Error',
        description: 'Server-side error occurred'
      };
    }
    return {
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
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
        className="border-b px-6 py-4 bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Response
            </h3>
            {responseData && activeTab === 'body' && (
              <span className="text-sm text-gray-500">
                {formatSize(responseData.size)}
              </span>
            )}
            {headers && activeTab === 'headers' && (
              <span className="text-sm text-gray-500">
                {Object.keys(headers).length} headers
              </span>
            )}
            {elapsedTime && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{elapsedTime}ms</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {statusInfo && (
              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: statusInfo.backgroundColor }}
                >
                  <statusInfo.icon 
                    className="w-4 h-4" 
                    style={{ color: statusInfo.textColor }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: statusInfo.textColor }}
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
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-gray-100"
                    title={`Switch to ${viewMode === 'formatted' ? 'raw' : 'formatted'} view`}
                  >
                    {viewMode === 'formatted' ? <FileText className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{viewMode === 'formatted' ? 'Raw' : 'Formatted'}</span>
                  </button>
                )}
                
                <button
                  onClick={downloadResponse}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600"
                  title={`Download ${activeTab}`}
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600"
                  title={`Copy ${activeTab}`}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
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
        <div className="border-b bg-white">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('body')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'body'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>Body</span>
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'headers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Headers</span>
            </button>
          </nav>
        </div>
      )}

      <div className="flex-1 bg-gray-50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Sending request...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please wait while we process your request
              </p>
            </div>
          </div>
        ) : (responseData || headers) ? (
          <div className="h-full flex flex-col">
            {responseData?.isError && activeTab === 'body' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700 font-medium">
                    Error Response Detected
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === 'body' && responseData ? (
                <div 
                  className="rounded-lg border bg-white shadow-sm"
                  style={{ borderColor: responseData.isError ? '#fca5a5' : '#e5e7eb' }}
                >
                  <div className="p-4">
                    <pre
                      className="text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-auto"
                      style={{
                        color: responseData.isError ? '#dc2626' : '#374151',
                        maxHeight: 'calc(100vh - 300px)'
                      }}
                    >
                      {viewMode === 'formatted' ? responseData.formatted : responseData.raw}
                    </pre>
                  </div>
                </div>
              ) : activeTab === 'headers' && headers ? (
                <div className="rounded-lg border bg-white shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                  <div className="p-4">
                    <div className="grid gap-3">
                      {Object.entries(headers).map(([key, value]) => (
                        <div key={key} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {key}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-mono break-all">
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
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
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
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Code className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Response Yet
              </h4>
              <p className="text-gray-600 mb-1">
                Send a request to see the response here
              </p>
              <p className="text-sm text-gray-500">
                The response will be automatically formatted and displayed with syntax highlighting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
