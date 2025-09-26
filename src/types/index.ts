// This interface defines the exact structure of the JSON response
// our frontend expects from the Python backend.
export interface AIResponse {
  summary: string;
  chartType: 'bar' | 'line' | 'pie' | 'table' | 'text';
  chartData: Array<{ [key: string]: any }>;
  tableData: {
    headers: string[];
    rows: any[][];
  };
}

// This interface defines the structure for a single message in the chat history.
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  // The 'data' property is optional and only exists for AI messages
  // that contain analysis results. Its structure matches the AIResponse.
  data?: AIResponse;
}

