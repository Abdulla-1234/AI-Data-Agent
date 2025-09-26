import { DatabaseTable } from '../types';

// Simulating a deliberately bad database schema with cryptic names and dirty data
export const mockDatabase: DatabaseTable[] = [
  {
    name: "tbl_01_users",
    columns: ["id", "c3", "nm", "reg", "dt_join"],
    data: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      c3: `user${i + 1}@email.com`, // c3 = email (cryptic naming)
      nm: `User ${i + 1}`, // nm = name
      reg: i % 4 === 0 ? "north america" : i % 4 === 1 ? "North America" : i % 4 === 2 ? "NA" : "europe", // inconsistent casing
      dt_join: i % 3 === 0 ? `2024-0${(i % 12) + 1}-15` : i % 3 === 1 ? `0${(i % 12) + 1}/15/2024` : `January ${15 + (i % 15)}, 2024` // multiple date formats
    }))
  },
  {
    name: "transaction_log_final",
    columns: ["txn_id", "user_ref", "val", "cat", "dt"],
    data: Array.from({ length: 200 }, (_, i) => ({
      txn_id: `TXN${String(i + 1).padStart(4, '0')}`,
      user_ref: Math.floor(Math.random() * 50) + 1, // refers to user id
      val: i % 5 === 0 ? `$${(Math.random() * 1000).toFixed(2)}` : i % 5 === 1 ? `${(Math.random() * 1000).toFixed(2)}` : `$${Math.floor(Math.random() * 10)},${String(Math.floor(Math.random() * 900) + 100)}.${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`, // mixed price formats
      cat: i % 4 === 0 ? "electronics" : i % 4 === 1 ? "Electronics" : i % 4 === 2 ? "ELECTRONICS" : i % 4 === 3 ? "books" : null, // inconsistent categories
      dt: i % 2 === 0 ? `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/2024`
    }))
  },
  {
    name: "prod_master",
    columns: ["p_id", "desc_text", "price_str", "cat_nm"],
    data: Array.from({ length: 75 }, (_, i) => ({
      p_id: `P${String(i + 1).padStart(3, '0')}`,
      desc_text: i % 10 === 0 ? "" : `Product ${i + 1} Description`, // some empty descriptions
      price_str: i % 3 === 0 ? `$${(Math.random() * 500 + 10).toFixed(2)}` : `${(Math.random() * 500 + 10).toFixed(2)}`, // mixed price formats
      cat_nm: i % 5 === 0 ? "electronics" : i % 5 === 1 ? "Books" : i % 5 === 2 ? "CLOTHING" : i % 5 === 3 ? null : "home & garden" // inconsistent naming and nulls
    }))
  },
  {
    name: "sales_data_v3",
    columns: ["sale_id", "emp_code", "quarter", "amt", "region_cd"],
    data: Array.from({ length: 100 }, (_, i) => ({
      sale_id: i + 1,
      emp_code: `E${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
      quarter: `Q${Math.floor(Math.random() * 4) + 1} 2024`,
      amt: i % 6 === 0 ? null : i % 6 === 1 ? `$${(Math.random() * 10000).toFixed(2)}` : `${(Math.random() * 10000).toFixed(2)}`, // some nulls, mixed formats
      region_cd: i % 3 === 0 ? "N" : i % 3 === 1 ? "North" : "NORTH"
    }))
  }
];

// Function to get database schema information (simulating SQL DESCRIBE)
export const getDatabaseSchema = (): string => {
  return mockDatabase.map(table => 
    `Table: ${table.name}\nColumns: ${table.columns.join(', ')}\n`
  ).join('\n');
};

// Simple query executor that simulates SQL operations
export const executeQuery = (query: string): any[] => {
  try {
    const lowerQuery = query.toLowerCase().trim();
    
    // Simple pattern matching for basic SQL operations
    if (lowerQuery.includes('select') && lowerQuery.includes('from')) {
      const tableMatch = lowerQuery.match(/from\s+(\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = mockDatabase.find(t => t.name.toLowerCase() === tableName);
        
        if (table) {
          // For demo purposes, return sample data
          // In a real implementation, this would parse and execute the full SQL
          return table.data.slice(0, 10);
        }
      }
    }
    
    // Return sample data if we can't parse the query
    return mockDatabase[0].data.slice(0, 5);
  } catch (error) {
    throw new Error('Query execution failed');
  }
};