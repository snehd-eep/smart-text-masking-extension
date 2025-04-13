# Text Masking Analyzer

This project provides a system for analyzing text and identifying sensitive information that should be masked. It uses Llama 3 via Ollama to perform the analysis and generates tabular data with masking recommendations.

## Components

1. **Python Backend (`mask_analyzer.py`)**: A Flask server that communicates with Ollama to analyze text and generate masking recommendations.

2. **Web Interface (`mask_analyzer.html`)**: A simple web interface for testing the masking analysis.

## Prerequisites

- Python 3.7+
- Ollama with Llama 3 model installed
- Flask and other Python dependencies

## Installation

1. Install Ollama and the Llama 3 model:
   ```
   # Install Ollama (if not already installed)
   # See https://ollama.ai/download for installation instructions
   
   # Pull the Llama 3 model
   ollama pull llama3
   ```

2. Install Python dependencies:
   ```
   pip install flask flask-cors requests pandas
   ```

## Usage

### Running the Python Backend

1. Start the Flask server:
   ```
   python mask_analyzer.py
   ```

2. The server will run on `http://localhost:5000`.

### Using the Web Interface

1. Open `mask_analyzer.html` in a web browser.
2. Enter text in the textarea and click "Analyze Text".
3. The results will show the original text, masked text, and a table of masking recommendations.

## How It Works

1. The text is sent to the Python backend.
2. The backend sends the text to Llama 3 via Ollama with a prompt to identify sensitive information.
3. Llama 3 returns a JSON array with masking recommendations.
4. The backend processes the recommendations and returns:
   - The original text
   - The masked text (with sensitive information replaced)
   - A table of masking recommendations

## Example

Input text:
```
My name is John Smith and my email is john.smith@example.com. My phone number is 555-123-4567 and my address is 123 Main St, Anytown, USA.
```

Output:
- **Masked Text**: My name is [NAME] and my email is [EMAIL]. My phone number is [PHONE] and my address is [ADDRESS].
- **Masking Recommendations**:
  - Original: John Smith, Mask: [NAME], Reason: Personal name
  - Original: john.smith@example.com, Mask: [EMAIL], Reason: Email address
  - Original: 555-123-4567, Mask: [PHONE], Reason: Phone number
  - Original: 123 Main St, Anytown, USA, Mask: [ADDRESS], Reason: Physical address

## Troubleshooting

- Make sure Ollama is running and the Llama 3 model is installed.
- Check that the Python server is running on `http://localhost:5000`.
- If you get CORS errors, ensure that the Flask-CORS extension is properly configured.

## License

MIT 

# Smart Text Masking Chrome Extension

A Chrome extension that provides real-time text analysis and masking suggestions using a local LLaMA model. The extension analyzes text input and suggests appropriate masking for potentially sensitive information.

## Features

- **Real-time Text Analysis**: 
  - Analyzes text as you type using a local LLaMA model
  - Provides context-aware suggestions for sensitive information
  - Background processing for smooth user experience

- **Smart Suggestions**:
  - Individual word replacement options
  - "Replace All" functionality for batch processing
  - Displays reason for each suggested masking
  - Suggestions disappear after use

- **User-Friendly Interface**:
  - Clean, modern UI with clear suggestions
  - Floating suggestion container
  - Easy-to-use buttons for quick actions
  - Container automatically closes when text is deleted

- **Performance Optimizations**:
  - Debounced input handling (500ms delay)
  - Background analysis without blocking UI
  - Efficient suggestion management
  - No re-analysis of previously masked text

## Prerequisites

- Python 3.8 or higher
- Chrome browser
- Ollama with llama3:8b model installed

## Installation

1. Clone this repository:
   ```bash
   git clone [repository-url]
   ```

2. Install the required Python dependencies:
   ```bash
   pip install flask flask-cors requests pandas
   ```

3. Install Ollama and the llama3:8b model:
   ```bash
   # Install Ollama (if not already installed)
   # See https://ollama.ai/download for installation instructions
   
   # Pull and run the llama3:8b model
   ollama run llama3:8b
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

## Usage

1. Start the Python backend server:
   ```bash
   python test_masking_llama.py
   ```

2. The extension will automatically activate on text input areas

3. As you type, the extension will:
   - Analyze the text for sensitive information
   - Show a suggestion container with:
     - Individual word replacement options
     - Reasons for suggested masking
     - A "Replace All" button for batch processing

4. Interaction options:
   - Click individual suggestions to replace specific words
   - Use "Replace All" to apply all suggestions at once
   - Close button to dismiss suggestions
   - Container automatically closes when:
     - All suggestions are used
     - Text is deleted
     - "Replace All" is clicked
     - Close button is clicked

## Project Structure

```
├── content/
│   └── content.js          # Main extension functionality
├── test_masking_llama.py   # Python backend server
├── test_masking_ui.html    # Test UI for development
├── manifest.json           # Extension configuration
└── README.md              # Documentation
```

## Technical Details

- **Frontend**: 
  - Pure JavaScript implementation
  - No external dependencies
  - Event-driven architecture
  - Debounced input handling

- **Backend**:
  - Flask server
  - Ollama integration with llama3:8b model
  - RESTful API endpoint
  - Local processing for privacy

- **API Endpoint**: 
  - URL: `http://localhost:5000/analyze`
  - Method: POST
  - Input: JSON with text field
  - Output: Markdown table with suggestions

## Development

- The extension uses a modular architecture
- All UI is generated dynamically in JavaScript
- Styling is handled inline for portability
- Event handlers manage user interactions
- Background processing prevents UI blocking

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT 