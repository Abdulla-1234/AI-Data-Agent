import os
import json
import re
import uuid
import pandas as pd
import sqlalchemy
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal

from langchain_community.utilities import SQLDatabase
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.agent_toolkits import create_sql_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# --- SETUP ---
load_dotenv()
DB_FILE = "analytics.db"

# --- DATABASE CONNECTION & LLM ---
engine = sqlalchemy.create_engine(f"sqlite:///{DB_FILE}")
db = SQLDatabase(engine=engine)

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-latest",
    temperature=0,
    transport="rest"
)

# --- API DATA MODELS ---
class AIResponse(BaseModel):
    summary: str = Field(description="A concise, natural language summary of the findings.")
    chartType: Literal["bar", "line", "pie", "table", "text"] = Field(description="The suggested chart type for visualization.")
    chartData: List[Dict[str, Any]] = Field(description="Data formatted for Recharts.")
    tableData: Dict[str, List[Any]] = Field(description="Data for a table, with 'headers' and 'rows' keys.")

class AskRequest(BaseModel):
    question: str
    session_id: str

# --- FASTAPI APP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- UTILITY FUNCTION ---
def clean_column_name(col_name: str) -> str:
    col_name = str(col_name).strip()
    col_name = re.sub(r'\s+', '_', col_name)
    col_name = re.sub(r'[^0-9a-zA-Z_]', '', col_name)
    return col_name if col_name else "unnamed_col"

# --- API ENDPOINTS ---
@app.post("/api/upload")
async def upload_excel_file(file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    table_name = f"data_{session_id.replace('-', '_')}"
    try:
        df = pd.read_excel(file.file)
        df.columns = [clean_column_name(col) for col in df.columns]
        df.to_sql(table_name, con=engine, index=False, if_exists="replace")
        schema = {col: str(dtype) for col, dtype in df.dtypes.items()}
        return {"session_id": session_id, "table_name": table_name, "schema": schema}
    except Exception as e:
        return {"error": f"Failed to process file: {str(e)}"}

@app.post("/api/ask", response_model=AIResponse)
async def ask_question(request: AskRequest):
    table_name = f"data_{request.session_id.replace('-', '_')}"
    agent_prefix = """
    You are a helpful and expert SQL data analyst working with a SQLite database.
    Given a user question, create a syntactically correct SQLite query to run, then look at the results and return the answer.
    Unless the user specifies a number of examples, query for at most 10 results.
    You MUST use the exact column names from the table. Do not make up column names.
    Pay attention to column data types. If a column is text, you may need to cast it for calculations.
    For example, CAST(REPLACE(column_name, '$', '') AS REAL).
    """
    try:
        agent_executor: AgentExecutor = create_sql_agent(
            llm, db=db, agent_type="zero-shot-react-description",
            verbose=True, table_names=[table_name],
            agent_executor_kwargs={"handle_parsing_errors": True},
            prefix=agent_prefix
        )
        formatting_prompt_template = ChatPromptTemplate.from_messages([
            ("system", """
            You are an expert data visualization specialist. Format raw data and a user's question into a clean JSON response for a web app.
            - Your summary should be a concise, insightful sentence that directly answers the user's question.
            - Choose the BEST chart type: 'line' for trends, 'bar' for comparisons, 'pie' for proportions, 'table' for lists of records, or 'text' for single values.
            - Do not include any markdown formatting like ```json in your response. Your entire output must be a single, valid JSON object.
            """),
            ("user", "Based on the original question '{question}' and this SQL data '{data}', format the response as a JSON object matching this schema: {format_instructions}")
        ])
        parser = JsonOutputParser(pydantic_object=AIResponse)
        sql_result = agent_executor.invoke({"input": request.question})
        raw_data_response = sql_result["output"]
        prompt = formatting_prompt_template.format(
            question=request.question, data=raw_data_response,
            format_instructions=parser.get_format_instructions()
        )
        llm_response = llm.invoke(prompt)
        response_text = llm_response.content
        match = re.search(r"```(json)?(.*)```", response_text, re.DOTALL)
        clean_text = match.group(2).strip() if match else response_text.strip()
        parsed_json = json.loads(clean_text)
        return AIResponse(**parsed_json)
    except Exception as e:
        print(f"An error occurred: {e}")
        error_summary = "The AI agent had trouble understanding the request. Please try rephrasing your question." if "parsing" in str(e).lower() else f"An unexpected error occurred: {str(e)}"
        return AIResponse(
            summary=error_summary, chartType="text",
            chartData=[], tableData={"headers": ["Error"], "rows": [[error_summary]]}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

