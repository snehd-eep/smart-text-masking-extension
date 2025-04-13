# Text Masking Analyzer

This project provides a system for analyzing text and identifying sensitive information that should be masked. It uses Llama 3 via Ollama to perform the analysis and generates tabular data with masking recommendations.

## Components

1. **Python Backend (`mask_analyzer.py`)**: A Flask server that communicates with Ollama to analyze text and generate masking recommendations.

2. **Web Interface (`mask_analyzer.html`)**: A simple web interface for testing the masking analysis.

3. **Extension Integration (`extension_integration.js`)**: JavaScript code that can be integrated with a Chrome extension to send text for analysis.

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

### Integrating with a Chrome Extension

1. Include the `extension_integration.js` file in your extension.
2. Use the `MaskingAnalyzer` object to analyze text:

   ```javascript
   // Example: Analyze selected text
   document.addEventListener('mouseup', () => {
       const selectedText = window.getSelection().toString().trim();
       if (selectedText) {
           MaskingAnalyzer.showMaskingAnalysis(selectedText);
       }
   });
   ```

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

A Chrome extension that provides intelligent text masking suggestions for sensitive information in ChatGPT and other text input areas.

## Features

- **Real-time Text Analysis**: Analyzes text as you type to identify potentially sensitive information
- **Smart Suggestions**: Provides context-aware suggestions for masking sensitive data
- **Multiple Replacement Options**:
  - Individual word replacement
  - "Replace All" functionality for batch processing
  - Custom replacement suggestions based on context
- **User-Friendly Interface**:
  - Clean, modern UI with clear suggestions
  - Hover effects for better interaction
  - Easy-to-use buttons for quick actions
- **Intelligent Processing**:
  - Debounced input handling to prevent excessive API calls
  - Background processing to maintain smooth user experience
  - Prevents duplicate suggestions for already masked text

## Installation

1. Clone this repository:
   ```bash
   git clone [repository-url]
   ```

2. Install the required Python dependencies:
   ```bash
   pip install flask transformers torch
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

## Setup

1. Start the Python backend server:
   ```bash
   python test_masking_llama.py
   ```

2. The extension will automatically connect to the local server running on port 5000

## Usage

1. The extension automatically activates on ChatGPT and other text input areas
2. As you type, it analyzes the text for potentially sensitive information
3. Suggestions appear in a floating container with:
   - Individual word replacement options
   - A "Replace All" button for batch processing
   - Reasons for each suggested replacement
4. Click on any suggestion to replace the word, or use "Replace All" to process all suggestions at once

## Features in Detail

### Text Analysis
- Real-time analysis of input text
- Context-aware suggestion generation
- Intelligent word boundary detection

### Suggestion Interface
- Clean, modern design
- Hover effects for better interaction
- Clear display of original and replacement words
- Contextual reasons for suggestions

### Replacement Options
- Individual word replacement
- Batch replacement with "Replace All"
- Automatic removal of used suggestions
- Prevention of duplicate suggestions

### Performance
- Debounced input handling (500ms delay)
- Background processing
- Efficient API usage
- Smooth user experience

## Technical Details

- **Frontend**: Chrome Extension (JavaScript)
- **Backend**: Python Flask Server
- **Model**: Llama-based text analysis
- **API Endpoint**: `http://localhost:5000/analyze`

## Contributing

Feel free to submit issues and enhancement requests!

## License

[Your chosen license] 