import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Plus,
  Settings,
  Folder,
  Variable,
  Clock,
  Copy,
  Save,
} from "lucide-react";
import "./App.css";

const Dashboard = () => {
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [url, setUrl] = useState("https://{{BASE_URL}}/api/users");
  const [expandedCollections, setExpandedCollections] = useState({
    users: true,
    auth: false,
    products: false,
  });
  const [activeTab, setActiveTab] = useState("body");
  const [responseTab, setResponseTab] = useState("body");

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  const collections = {
    users: ["Get All", "Get One", "Create", "Delete"],
    auth: ["Login", "Register"],
    products: ["List Products", "Create Product"],
  };

  const variables = [
    { name: "BASE_URL", value: "http://localhost:4000" },
    { name: "API_TOKEN", value: "eyJhbGciOiJIUzI1NiIs..." },
    { name: "USER_ID", value: "123" },
  ];

  const history = [
    { time: "14:32", method: "GET", status: 200 },
    { time: "14:30", method: "POST", status: 201 },
    { time: "14:28", method: "GET", status: 200 },
    { time: "14:25", method: "PUT", status: 200 },
  ];

  const toggleCollection = (name) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "text-emerald-400",
      POST: "text-blue-400",
      PUT: "text-yellow-400",
      DELETE: "text-red-400",
      PATCH: "text-purple-400",
    };
    return colors[method] || "text-gray-400";
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "text-emerald-400";
    if (status >= 400) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🦥</span>
          <span className="text-xl font-semibold text-emerald-400">
            LazySloth
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
            <Folder className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Workspace: Mon Projet API</span>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Collections */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Collections
              </h3>
              <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1">
              {Object.entries(collections).map(([collectionName, requests]) => (
                <div key={collectionName}>
                  <button
                    onClick={() => toggleCollection(collectionName)}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
                  >
                    {expandedCollections[collectionName] ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <Folder className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm capitalize">
                      {collectionName} API
                    </span>
                  </button>
                  {expandedCollections[collectionName] && (
                    <div className="ml-6 space-y-1">
                      {requests.map((request) => (
                        <button
                          key={request}
                          className="w-full flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-sm text-gray-300">
                            {request}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Variables */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Variables
              </h3>
              <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {variables.map((variable) => (
                <div
                  key={variable.name}
                  className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg"
                >
                  <Variable className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-emerald-400">
                      {variable.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {variable.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="p-4 flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                History
              </h3>
            </div>
            <div className="space-y-1">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="text-xs text-gray-500">{item.time}</span>
                  <span
                    className={`text-xs font-medium ${getMethodColor(
                      item.method
                    )}`}
                  >
                    {item.method}
                  </span>
                  <span className={`text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Request Section */}
          <div className="h-1/2 p-6 border-b border-gray-800">
            {/* URL Bar */}
            <div className="flex items-center space-x-3 mb-6">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {methods.map((method) => (
                  <option
                    key={method}
                    value={method}
                    className={getMethodColor(method)}
                  >
                    {method}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter request URL"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Play className="w-4 h-4" />
                <span className="font-medium">Send</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-4">
              {["headers", "params", "body"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-gray-800 rounded-lg p-4 h-64 overflow-auto">
              {activeTab === "headers" && (
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <input
                      placeholder="Authorization"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Bearer {{API_TOKEN}}"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <input
                      placeholder="Content-Type"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="application/json"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <button className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Add Header</span>
                  </button>
                </div>
              )}

              {activeTab === "params" && (
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <input
                      placeholder="page"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="1"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <input
                      placeholder="limit"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="10"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <button className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Add Param</span>
                  </button>
                </div>
              )}

              {activeTab === "body" && (
                <div className="h-full">
                  <div className="flex space-x-2 mb-3">
                    <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option>raw</option>
                      <option>form-data</option>
                      <option>x-www-form-urlencoded</option>
                    </select>
                    <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option>JSON</option>
                      <option>Text</option>
                      <option>XML</option>
                    </select>
                  </div>
                  <textarea
                    className="w-full h-40 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono resize-none"
                    placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Response Section */}
          <div className="h-1/2 p-6">
            <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
              {/* Response Header */}
              <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-emerald-400 font-medium">
                      Status: 200 OK
                    </span>
                    <span className="text-gray-400">Time: 245ms</span>
                    <span className="text-gray-400">Size: 1.2kb</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Save className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Response Tabs */}
              <div className="flex space-x-1 p-4 pb-0">
                {["body", "headers", "tests"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResponseTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      responseTab === tab
                        ? "bg-emerald-600 text-white"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Response Content */}
              <div className="p-4 h-64 overflow-auto">
                <pre className="text-sm text-gray-300 font-mono">
                  {`{
  "users": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com"
    },
    {
      "id": 2,
      "name": "Bob Johnson",
      "email": "bob@example.com"
    }
  ],
  "total": 2
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
