**AI Data Agent - Full Stack**
A sophisticated AI-powered data analysis application that allows users to ask natural language questions about a real SQL database and receive intelligent insights with dynamic visualizations.

This project uses a React/TypeScript frontend and a Python (FastAPI) backend with LangChain and Google's Gemini AI to perform real-time, AI-driven data analysis.

🚀 Core Features
**Natural Language to SQL:** Converts plain English questions into precise SQL queries.
**Real AI Analysis:** Uses Google's Gemini AI via LangChain to analyze a messy, realistic SQLite database.
**Dynamic Visualizations:** The AI intelligently selects the best chart type (bar, line, pie, table) and formats the data for visualization.
**Interactive Chat Interface:** A modern, responsive chat-based UI built with React and Tailwind CSS.
**Handles Bad Schemas:** The AI is capable of navigating cryptic table/column names and dirty data (mixed formats, nulls, etc.).

🏗️ Architecture
**Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts for charts.
**Backend:** Python, FastAPI for the web server.
**AI Agent:** LangChain's SQL Agent to generate and execute queries.
**LLM:** Google Gemini (gemini-1.5-flash-latest) for reasoning and response formatting.
**Database:** SQLite with an intentionally messy and challenging schema.

🛠️ Local Development Setup
Prerequisites
Node.js 18+

Python 3.9+

A Google API Key for the Gemini API.

1. Backend Setup
Navigate to the backend directory:

cd backend

Create and activate a virtual environment:

On Windows:

python -m venv venv
.\venv\Scripts\activate

On macOS/Linux:

python3 -m venv venv
source venv/bin/activate

Install Python dependencies:

pip install -r requirements.txt

Set up your API Key:

Create a file named .env inside the backend folder.

Add your Google API key to it: GOOGLE_API_KEY="your_api_key_here"

Important: Ensure the "Generative Language API" is enabled for your key in the Google Cloud Console.

Generate the database:

Run this script once to create the analytics.db file.

python setup_database.py

2. Frontend Setup
From the project root directory (not the backend folder), install npm packages:

npm install

🚀 Running the Application
You will need to run two servers simultaneously in two separate terminals.

Terminal 1: Start the Backend Server
Navigate to the backend directory.

Ensure your virtual environment is active (you should see (venv) at the prompt).

Run the Uvicorn server:

uvicorn main:app --reload

The backend will be running at http://localhost:8000. Leave this terminal running.

Terminal 2: Start the Frontend Server
Open a new terminal.

Navigate to the project root directory.

Run the Vite development server:

npm run dev

The frontend will open at http://localhost:5173. Open this URL in your web browser.

💡 Example Questions to Try
"How many users do we have?"

"What are the product categories?"

"Show me the top 3 most expensive transactions. The price is in the 'val' column and is a string with dollar signs and commas."

"Show me the number of users by region in a bar chart."

"Which product category has the most sales?"

"Summarize user signups by month. The signup date is in the signup_dt column and has multiple formats."