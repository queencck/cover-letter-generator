from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import FireCrawlLoader
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = 'uploaded'

# Initialize OpenAI
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Define the web scraping tool
@tool
def webScrape(url: str) -> str:
    """Scrape the content of a given URL using the Firecrawl API and return the result"""
    loader = FireCrawlLoader(
        api_key=os.getenv("FIRECRAWL_API_KEY"),
        url=url,
        mode="scrape"
    )
    doc = loader.load()
    return doc[0].page_content

@tool
def readPdf(path: str) -> str:
    """Read the content of a PDF file of a given file path"""
    loader = loader = PyPDFLoader(path)
    pages = []
    for page in loader.load():
        pages.append(page)

    return pages

# Create the agent
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a professional cover letter generation assistant. Generate a personalized and concise cover letter tailored to the provided resume and job posting."), 
    ("human", "{input}"), 
    ("placeholder", "{agent_scratchpad}"),
])

tools = [webScrape, readPdf]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Create the prompt template
template = """
    You are a professional cover letter generation assistant. Generate a personalized and concise cover letter tailored to the provided resume and job posting.

    Resume path: {resume_path}  
    Job post URL or content: {job_post}  
    Target word count: {word_count} words

    Requirements:
    - Start the letter with "Dear Hiring Manager," unless a specific name is available in the job post.
    - Include an introductory paragraph that states the position applied for and a compelling hook.
    - In the body, highlight 2-3 achievements or skills that directly match the job description.
    - Reference technologies, projects, or values that align with the company's focus.
    - End with a closing paragraph expressing enthusiasm and a call to action (e.g., availability for interview).
    - Sign off with a professional closing (e.g., "Sincerely," or "Best regards,") followed by the applicant's full name.

    Restrictions:
    - Do NOT include the employer's address.
    - Do NOT include the applicant's contact details or resume content outside what's relevant to the role.
    - ONLY return the content of the cover letter, nothing else.
    """

prompt = PromptTemplate.from_template(template)

@app.route('/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    try:
        resume = request.files["resume"]
        job_post = request.form["job_post"]
        word_count = 300

        if not resume or not job_post:
            return jsonify({'error': 'Resume and job post URL are required'}), 400
        
        # Save the resume
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], resume.filename)
        resume.save(file_path)

        # Create the chain
        chain = prompt | (lambda completePrompt: {"input": completePrompt}) | agent_executor

        # Generate the cover letter
        response = chain.invoke({
            "resume_path": file_path,
            "job_post": job_post,
            "word_count": word_count
        })

        return jsonify({
            'cover_letter': response['output']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 