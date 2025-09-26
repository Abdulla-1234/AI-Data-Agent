import { AIResponse } from '../types';

const API_URL = 'http://localhost:8000';

export const getAIResponse = async (question: string): Promise<AIResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get response from the server.');
    }

    const data: AIResponse = await response.json();
    return data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error:', errorMessage);
    return {
      summary: `Error: ${errorMessage}`,
      chartType: 'text',
      chartData: [],
      tableData: { headers: ["Error"], rows: [[errorMessage]] },
    };
  }
};