import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';

// The props now match the 'chartType' from our main AIResponse definition
interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'table' | 'text';
  data: Array<{ [key: string]: any }>;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export const ChartComponent: React.FC<ChartComponentProps> = ({ type, data }) => {
  // Don't render a chart if there's no data for it
  if (!data || data.length === 0) {
    if (type !== 'text' && type !== 'table') {
        return <div className="text-sm text-center text-gray-500 py-4">No data available for visualization.</div>;
    }
    return null;
  }

  switch (type) {
    case 'bar':
      return (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip wrapperStyle={{ fontSize: '14px' }} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'line':
      return (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip wrapperStyle={{ fontSize: '14px' }}/>
              <Legend wrapperStyle={{ fontSize: '14px' }}/>
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                // This line is now fixed by telling TypeScript to treat the argument as 'any',
                // bypassing the library's complex type definition that was causing the error.
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip wrapperStyle={{ fontSize: '14px' }}/>
              <Legend wrapperStyle={{ fontSize: '14px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );

    // This component will NOT render tables or text, as ChatMessage handles them.
    case 'table':
    case 'text':
      return null;

    default:
      return <div className="text-sm text-center text-red-500 py-4">Unsupported chart type.</div>;
  }
};

