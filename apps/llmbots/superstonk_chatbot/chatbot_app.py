from openai import OpenAI
from flask import Flask, request, session, render_template
import os
import json
import logging
from sentence_transformers import SentenceTransformer

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a secure random key

# Configure logging
logger = logging.getLogger(__name__)

# Load JSON data
def load_and_index_data():
    output_file = "/Users/dimitristefanopoulos/Downloads/42069/42069/yek/output/yek-output.json"
    if not os.path.exists(output_file):
        logger.error("Data file 'output_file' not found")
        raise HTTPException(status_code=500, detail="Data file not found")
    with open(output_file, 'r') as f:
        data = json.load(f)
    if not data:
        logger.error("No data loaded from JSON")
        return []
    texts = [item.get('content', '') for item in data]
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(texts, show_progress_bar=True)
    return texts, embeddings

# Route for the homepage (index.html)
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        api_key = request.form.get('api_key')
        if api_key:
            session['api_key'] = api_key
            return render_template('index.html', message="API Key saved!")
    return render_template('index.html')

# Route to set API key
@app.route('/set_api_key', methods=['POST'])
def set_api_key():
    data = request.json
    api_key = data.get('api_key')
    if api_key:
        session['api_key'] = api_key
        return {"message": "API Key set"}, 200
    return {"error": "No API key provided"}, 400

# Route for chatbot query
@app.route('/query', methods=['POST'])
def query():
    data = request.json
    question = data.get('question')
    if not question:
        return {"error": "No question provided"}, 400
    if not session.get('api_key'):
        return {"error": "Please set an OpenAI API key first"}, 400
    
    # Initialize OpenAI client with user-provided key
    openai_client = OpenAI(api_key=session['api_key'])
    
    # Your chatbot logic here (e.g., GME DD response using texts, embeddings)
    texts, embeddings = load_and_index_data()
    response = {"response": "Here's your answer about GME..."}  # Replace with actual logic
    return response, 200

if __name__ == '__main__':
    app.run(debug=True)
