import os
import json
import re
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal

from langchain_community.utilities import SQLDatabase
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.agent_toolkits import create_sql_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# --- SETUP ---
load_dotenv()

# --- MODELS & DATABASE ---
db = SQLDatabase.from_uri("sqlite:///analytics.db")

# We will use 'gemini-1.5-flash-latest' which is efficient and free.
# The `transport="rest"` argument is the key to forcing the use of the
# correct "Generative Language API" instead of the "Vertex AI" API.
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-latest",
    temperature=0,
    transport="rest"
)

# --- LANGCHAIN SQL AGENT ---
# This part works correctly and gets the raw data from the database.
sql_agent_executor = create_sql_agent(llm, db=db, agent_type="zero-shot-react-description", verbose=True)

# --- RESPONSE FORMATTING ---
# We still define the desired JSON structure using Pydantic.
class AIResponse(BaseModel):
    summary: str = Field(description="A concise, natural language summary of the findings.")
    chartType: Literal["bar", "line", "pie", "table", "text"] = Field(description="The suggested chart type for visualization.")
    chartData: List[Dict[str, Any]] = Field(description="Data formatted for Recharts (e.g., [{'name': 'A', 'value': 100}]).")
    tableData: Dict[str, List[Any]] = Field(description="Data for a table, with 'headers' and 'rows' keys.")

# We use the parser just to get the format instructions for the prompt.
parser = JsonOutputParser(pydantic_object=AIResponse)

# The prompt template to guide the LLM's formatting.
formatting_prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are an expert data analyst. Your job is to take raw data and a user's question and format it into a clean JSON response for a web application. You must adhere to the provided JSON schema. Do not include any markdown formatting like ```json in your response."),
    ("user", "Based on the original question '{question}' and the following data from a SQL query '{data}', please format the response. The data might be a single value, a list of values, or a full table. Choose the BEST chart type to represent this data. For table data, the first line is often the header. Format your response as a JSON object that matches this schema: {format_instructions}")
])

# --- FASTAPI APP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "[http://127.0.0.1:5173](http://127.0.0.1:5173)"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

@app.post("/api/ask", response_model=AIResponse)
async def ask_question(request: QuestionRequest):
    try:
        # Step 1: Run the SQL Agent to get the raw data response.
        sql_result = sql_agent_executor.invoke({"input": request.question})
        raw_data_response = sql_result["output"]

        # --- NEW ROBUST PARSING LOGIC ---
        # Step 2: Manually format the prompt for the LLM.
        prompt = formatting_prompt_template.format(
            question=request.question,
            data=raw_data_response,
            format_instructions=parser.get_format_instructions()
        )

        # Step 3: Directly call the LLM and get its text response.
        llm_response = llm.invoke(prompt)
        response_text = llm_response.content

        # Step 4: Clean the text (remove potential markdown fences just in case).
        # This regex finds a JSON object or array within ```json ... ```
        match = re.search(r"```(json)?(.*)```", response_text, re.DOTALL)
        if match:
            clean_text = match.group(2).strip()
        else:
            clean_text = response_text.strip()
            
        # Step 5: Manually parse the cleaned text into a Python dictionary.
        parsed_json = json.loads(clean_text)

        # Step 6: Validate the dictionary against our Pydantic model and return it.
        validated_response = AIResponse(**parsed_json)
        return validated_response

    except Exception as e:
        print(f"An error occurred during processing: {e}")
        # Return a structured error to the frontend.
        return AIResponse(
            summary=f"An error occurred: {str(e)}",
            chartType="text",
            chartData=[],
            tableData={"headers": ["Error"], "rows": [["Could not process the request."]]}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

