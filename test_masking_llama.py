from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration for Llama 3 API
LLAMA_API_ENDPOINT = "http://localhost:11434/api/generate"  # Ollama API endpoint
MODEL_NAME = "llama3:8b"  # Updated to match your installed model name

def get_masked_words_with_llama(text):
    """
    Use Llama 3 to analyze text and extract words that should be masked.
    Returns a markdown table with masking recommendations.
    """
    prompt = f"""Analyze the following text and extract words that should be masked (e.g., names, locations, sensitive info). 
    Format the output as a markdown table with columns: 
    - "Original Word" 
    - "Masking Reason" 
    - "Suggested Replacement"

    Example Output:
    | Original Word | Masking Reason | Suggested Replacement |
    |---------------|----------------|-----------------------|
    | John Doe      | Person's name  | [NAME]                |
    | New York      | Location       | [LOCATION]           |

    Text: "{text}"
    """

    try:
        # Make request to Llama 3 API
        response = requests.post(
            LLAMA_API_ENDPOINT,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.status_code != 200:
            print(f"Error from Llama API: {response.status_code}")
            return None
            
        result = response.json()
        print("\n=== Raw Llama Response ===")
        print(json.dumps(result, indent=2))
        print("========================\n")
        
        table_output = result.get("response", "")
        
        # Extract the table part
        table_start = table_output.find("| Original Word")
        table_end = table_output.find("\n\n", table_start)
        if table_start != -1 and table_end != -1:
            table = table_output[table_start:table_end].strip()
        else:
            table = table_output
            
        return table
    except Exception as e:
        print(f"Error calling Llama API: {e}")
        return None

def create_masked_text(text, table):
    """Create masked text by replacing all identified words"""
    if not table:
        return text
        
    masked_text = text
    for line in table.split('\n')[2:]:  # Skip header and separator
        if '|' in line:
            parts = line.split('|')
            if len(parts) >= 4:
                original = parts[1].strip()
                replacement = parts[3].strip()
                masked_text = re.sub(r'\b' + re.escape(original) + r'\b', replacement, masked_text)
    return masked_text

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')
    
    # Get the masking table using Llama 3
    table = get_masked_words_with_llama(text)
    
    if not table:
        return jsonify({
            'error': 'Failed to analyze text with LLM',
            'masked_text': text,
            'table_markdown': '',
            'table_html': ''
        })
    
    # Create masked text by replacing all identified words
    masked_text = create_masked_text(text, table)
    
    # Return the results
    return jsonify({
        'masked_text': masked_text,
        'table_markdown': table,
        'table_html': f'<table>{table}</table>'  # Simple HTML table
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) 