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
