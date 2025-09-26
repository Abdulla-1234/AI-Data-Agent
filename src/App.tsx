import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage.tsx';
import { getAIResponse } from './services/aiService.ts';
import { ChatMessage as ChatMessageType, AIResponse } from './types'; // Import AIResponse type
import { Send, Database, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Data Agent. I can help you analyze data from our analytics database. Try asking me questions like 'Show me user data', 'What are the sales trends?', or 'Compare categories by revenue'.",
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);
    setError(null);

    try {
      // --- CHANGE #1: Use the correct function name ---
      const result: AIResponse = await getAIResponse(currentInput);
      
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        // --- CHANGE #2: Use the real summary from the AI ---
        content: result.summary, 
        data: result, // Pass the full result object to the component
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessageText = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessageText);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I apologize, but I encountered an error: ${errorMessageText}. Please try rephrasing your question.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "Show me user data by region",
    "What are the sales trends over time?",
    "Compare categories by revenue",
    "How many users are there?",
    "What are the top 3 most expensive transactions?"
  ];

  const handleExampleClick = (question: string) => {
    if (!isLoading) {
      setCurrentInput(question);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Data Agent</h1>
            <p className="text-sm text-gray-600">Ask questions about your analytics data</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col h-[calc(100vh-88px)]">
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 pr-4">
          <div className="space-y-1">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 border border-gray-200">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                  <span className="text-sm text-gray-600">Analyzing your question...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Example Questions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Try these example questions:</h3>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Ask a question about your data..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!currentInput.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

