import re
import requests
import json

# Configuration for Llama 3 API
LLAMA_API_ENDPOINT = "http://localhost:11434/api/generate"  # Adjust this to your Llama 3 API endpoint
MODEL_NAME = "llama3:8b"  # Adjust this to your model name

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

def get_masked_words_fallback(text):
    """
    Fallback function that uses regex patterns to identify sensitive information.
    This is used if the Llama 3 API call fails.
    """
    # Define patterns to look for
    patterns = [
        (r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', 'Person\'s name', '[NAME]'),
        (r'\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b', 'Location', '[LOCATION]'),
        (r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', 'IP address', '[IP_ADDRESS]'),
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'Email address', '[EMAIL]'),
        (r'\b\d{3}-\d{2}-\d{4}\b', 'SSN', '[SSN]'),
        (r'\b\d{16}\b', 'Credit card', '[CREDIT_CARD]'),
        (r'\b\d{10}\b', 'Phone number', '[PHONE]'),
    ]
    
    # Find all matches
    matches = []
    for pattern, reason, replacement in patterns:
        for match in re.finditer(pattern, text):
            matches.append((match.group(), reason, replacement))
    
    # Create markdown table
    table = "| Original Word | Masking Reason | Suggested Replacement |\n"
    table += "|---------------|----------------|-----------------------|\n"
    
    for original, reason, replacement in matches:
        table += f"| {original} | {reason} | {replacement} |\n"
    
    return table

# Test examples
test_texts = [
    "Elon Musk is the CEO of Tesla, which is based in Austin, Texas.",
    "My name is John Doe and my email is john.doe@example.com. My SSN is 123-45-6789.",
    "Please contact me at 555-123-4567 or visit our office at 123 Main Street, New York, NY 10001.",
    "The server IP is 192.168.1.1 and my credit card number is 4111111111111111."
]

# Run tests
for text in test_texts:
    print("\n" + "="*50)
    print(f"Original text: {text}")
    
    # Try to get masking table using Llama 3
    table = get_masked_words_with_llama(text)
    
    # If Llama 3 fails, use the fallback method
    if not table:
        print("Llama 3 API call failed, using fallback method")
        table = get_masked_words_fallback(text)
    
    print("\nMasking table:")
    print(table)
    
    # Create masked text
    masked_text = create_masked_text(text, table)
    print("\nMasked text:")
    print(masked_text)
    print("="*50) 