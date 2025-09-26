import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { ChartComponent } from './ChartComponent';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';

  // A helper to check if there is valid table data to display, aligning with types/index.ts
  const hasTableData = message.data?.tableData && 
                       message.data.tableData.headers?.length > 0 && 
                       message.data.tableData.rows?.length > 0;

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
        }`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        
        <div className={`flex flex-col gap-3 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg px-4 py-3 max-w-2xl ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          
          {message.data && !isUser && (
            <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Analysis Results</h4>
                <p className="text-sm text-gray-700 mb-4">{message.data.summary}</p>
                
                {/* This component renders the visual charts (bar, line, pie) */}
                <div className="mb-4">
                  <ChartComponent 
                    type={message.data.chartType} 
                    data={message.data.chartData} 
                  />
                </div>
                
                {/* This section is now corrected to use 'tableData' to render the data table */}
                {hasTableData && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Data Table</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            {/* Correctly maps over headers from tableData */}
                            {message.data.tableData.headers.map(header => (
                              <th key={header} className="text-left py-3 px-4 font-medium text-gray-700">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Correctly maps over rows from tableData */}
                          {message.data.tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-3 px-4 text-gray-600">
                                  {cell === null || cell === undefined ? 'NULL' : String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

