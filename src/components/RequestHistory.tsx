import { Clock } from "lucide-react";
import { RequestHistoryItem } from "../types/workspace";

interface RequestHistoryProps {
  history: RequestHistoryItem[];
  onSelectRequest: (method: string, url: string) => void;
}

export function RequestHistory({
  history,
  onSelectRequest,
}: RequestHistoryProps) {
  const methodColors = {
    GET: {
      backgroundColor: "var(--chart-1)",
      color: "var(--primary-foreground)",
      borderColor: "var(--chart-1)",
    },
    POST: {
      backgroundColor: "var(--chart-2)",
      color: "var(--primary-foreground)",
      borderColor: "var(--chart-2)",
    },
    PUT: {
      backgroundColor: "var(--chart-3)",
      color: "var(--primary-foreground)",
      borderColor: "var(--chart-3)",
    },
    DELETE: {
      backgroundColor: "var(--destructive)",
      color: "var(--destructive-foreground)",
      borderColor: "var(--destructive)",
    },
    PATCH: {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
      borderColor: "var(--accent)",
    },
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return { color: "var(--chart-1)" };
    if (status >= 300 && status < 400) return { color: "var(--chart-3)" };
    if (status >= 400 && status < 500) return { color: "var(--chart-4)" };
    if (status >= 500) return { color: "var(--destructive)" };
    return { color: "var(--muted-foreground)" };
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Clock
          className="w-4 h-4"
          style={{ color: "var(--muted-foreground)" }}
        />
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          Session History
        </h3>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg cursor-pointer transition-all group"
            style={{
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)",
            }}
            onClick={() => onSelectRequest(item.method, item.url)}
          >
            <div className="flex items-center justify-between">
              <span
                className="px-2 py-1 text-xs font-medium rounded border"
                style={methodColors[item.method as keyof typeof methodColors]}
              >
                {item.method}
              </span>
              {item.status && (
                <span
                  className="text-xs font-medium"
                  style={getStatusColor(item.status)}
                >
                  {item.status}
                </span>
              )}
            </div>
            <p
              className="text-xs mt-1 truncate transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              {item.url}
            </p>
            <p
              className="text-xs mt-1 flex items-center space-x-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Clock className="w-3 h-3" />
              <span>{formatTime(item.timestamp)}</span>
            </p>
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-8">
            <Clock
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: "var(--muted-foreground)" }}
            />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              No recent requests
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Session requests will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
