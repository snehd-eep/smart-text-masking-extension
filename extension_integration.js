/**
 * Extension Integration Script
 * 
 * This script provides functions to send text from the Chrome extension
 * to the Python backend for masking analysis.
 */

// Configuration
const API_ENDPOINT = 'http://localhost:5000/analyze';

/**
 * Send text to the Python backend for masking analysis
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} - The analysis results
 */
async function analyzeTextForMasking(text) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error analyzing text for masking:', error);
        throw error;
    }
}

/**
 * Create a masking analysis UI element
 * @param {Object} analysisResult - The result from analyzeTextForMasking
 * @returns {HTMLElement} - The UI element
 */
function createMaskingAnalysisUI(analysisResult) {
    // Create container
    const container = document.createElement('div');
    container.className = 'masking-analysis-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 12px 16px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Masking Analysis';
    title.style.margin = '0';
    title.style.fontSize = '16px';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #6c757d;
    `;
    closeButton.addEventListener('click', () => {
        document.body.removeChild(container);
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create content
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 16px;
        overflow-y: auto;
        flex-grow: 1;
    `;

    // Add masked text
    const maskedTextSection = document.createElement('div');
    maskedTextSection.style.marginBottom = '16px';

    const maskedTextTitle = document.createElement('h4');
    maskedTextTitle.textContent = 'Masked Text';
    maskedTextTitle.style.fontSize = '14px';
    maskedTextTitle.style.marginBottom = '8px';

    const maskedTextContent = document.createElement('div');
    maskedTextContent.style.cssText = `
        background-color: #f8f9fa;
        padding: 12px;
        border-radius: 4px;
        border: 1px solid #dee2e6;
        white-space: pre-wrap;
        font-size: 14px;
    `;
    maskedTextContent.textContent = analysisResult.masked_text;

    maskedTextSection.appendChild(maskedTextTitle);
    maskedTextSection.appendChild(maskedTextContent);

    // Add table
    const tableSection = document.createElement('div');

    const tableTitle = document.createElement('h4');
    tableTitle.textContent = 'Masking Recommendations';
    tableTitle.style.fontSize = '14px';
    tableTitle.style.marginBottom = '8px';

    const tableContainer = document.createElement('div');
    tableContainer.innerHTML = analysisResult.table_html;
    tableContainer.style.overflowX = 'auto';

    tableSection.appendChild(tableTitle);
    tableSection.appendChild(tableContainer);

    // Assemble the UI
    content.appendChild(maskedTextSection);
    content.appendChild(tableSection);
    container.appendChild(header);
    container.appendChild(content);

    return container;
}

/**
 * Show masking analysis for the selected text
 * @param {string} selectedText - The text selected by the user
 */
async function showMaskingAnalysis(selectedText) {
    try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            text-align: center;
        `;
        loadingIndicator.innerHTML = `
            <div style="margin-bottom: 10px;">Analyzing text...</div>
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(loadingIndicator);

        // Analyze the text
        const analysisResult = await analyzeTextForMasking(selectedText);

        // Remove loading indicator
        document.body.removeChild(loadingIndicator);

        // Create and show the UI
        const ui = createMaskingAnalysisUI(analysisResult);
        document.body.appendChild(ui);
    } catch (error) {
        console.error('Error showing masking analysis:', error);
        alert('Error analyzing text. Please make sure the Python server is running.');
    }
}

// Example usage:
// document.addEventListener('mouseup', () => {
//     const selectedText = window.getSelection().toString().trim();
//     if (selectedText) {
//         showMaskingAnalysis(selectedText);
//     }
// });

// Export functions for use in the extension
window.MaskingAnalyzer = {
    analyzeTextForMasking,
    showMaskingAnalysis
}; 