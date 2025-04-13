// Wait for the page to fully load
window.addEventListener('load', () => {
    console.log('Smart Suggestor initialized for ChatGPT');
  
    // Configuration for the masking analysis API
    const MASKING_API_ENDPOINT = 'http://localhost:5000/analyze';
    
    // Function to send text to the Python backend for masking analysis
    async function analyzeTextForMasking(text) {
        try {
            const response = await fetch(MASKING_API_ENDPOINT, {
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
            return null;
        }
    }
    
    // Function to get masked words from text using the Python backend
    async function getMaskedWords(text) {
        try {
            const response = await fetch(MASKING_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                console.error('Error from server:', data.error);
                return null;
            }
            
            // Return the table directly from the response
            return data.table_markdown;
        } catch (error) {
            console.error('Error getting masked words:', error);
            return null;
        }
    }
    
    // Function to create a masking analysis UI
    function createMaskingAnalysisUI(analysisResult, input) {
        // Create container
        const container = document.createElement('div');
        container.id = 'masking-analysis-container';
        container.style.cssText = `
            position: fixed;
            z-index: 999999;
            background: #f8f9fa;
            border: 1px solid #d9d9e3;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 8px 0;
            max-height: 400px;
            overflow-y: auto;
            min-width: 300px;
            min-height: 30px;
            display: block;
            visibility: visible;
            opacity: 1;
            color: #000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        `;

        // Store the container reference in the input's dataset
        input.dataset.currentContainer = container.id;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 16px;
            background-color: #e9ecef;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Masking Suggestions';
        title.style.margin = '0';
        title.style.fontSize = '16px';
        title.style.color = '#000000';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        `;
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = '#f0f0f0';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = 'transparent';
        });
        closeButton.addEventListener('click', () => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
                // Store the last analyzed text and masked text to prevent re-analysis
                input.dataset.lastAnalyzedText = input.value;
                input.dataset.maskedText = input.value;
                delete input.dataset.currentContainer;
            }
        });

        header.appendChild(title);
        header.appendChild(closeButton);
        container.appendChild(header);

        // Parse the markdown table to get suggestions
        const lines = analysisResult.table_markdown.split('\n');
        const suggestions = [];
        
        // Skip header and separator rows
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').filter(cell => cell.trim() !== '');
            if (cells.length >= 3) {
                suggestions.push({
                    original: cells[0].trim(),
                    reason: cells[1].trim(),
                    replacement: cells[2].trim()
                });
            }
        }

        // Add "Replace All" button at the top
        const replaceAllButton = document.createElement('button');
        replaceAllButton.textContent = `Replace All Words (${suggestions.length})`;
        replaceAllButton.style.cssText = `
            margin: 8px 16px;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            width: calc(100% - 32px);
            box-sizing: border-box;
            transition: background-color 0.2s;
        `;
        replaceAllButton.addEventListener('mouseenter', () => {
            replaceAllButton.style.backgroundColor = '#0056b3';
        });
        replaceAllButton.addEventListener('mouseleave', () => {
            replaceAllButton.style.backgroundColor = '#007bff';
        });
        replaceAllButton.addEventListener('click', () => {
            if (input) {
                let newText = input.textContent || input.value;
                suggestions.forEach(suggestion => {
                    const regex = new RegExp(`\\b${suggestion.original}\\b`, 'gi');
                    newText = newText.replace(regex, suggestion.replacement);
                });
                
                if (input.contentEditable === 'true') {
                    input.textContent = newText;
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                } else {
                    input.value = newText;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                // Store the masked text
                input.dataset.maskedText = newText;
                
                // Remove the container
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                
                // Clear stored suggestions
                delete input.dataset.currentSuggestions;
                delete input.dataset.currentContainer;
                
                input.focus();
            }
        });
        container.appendChild(replaceAllButton);

        // Add a separator
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background-color: #dee2e6;
            margin: 8px 16px;
        `;
        container.appendChild(separator);

        // Add individual suggestions
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.style.cssText = `
                padding: 8px 16px;
                border-bottom: 1px solid #dee2e6;
                cursor: pointer;
                transition: background-color 0.2s;
            `;

            const wordSection = document.createElement('div');
            wordSection.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            `;

            const wordText = document.createElement('span');
            wordText.textContent = `${suggestion.original} → ${suggestion.replacement}`;
            wordText.style.fontWeight = 'bold';
            wordText.style.color = '#000000';

            const reasonText = document.createElement('span');
            reasonText.textContent = suggestion.reason;
            reasonText.style.cssText = `
                font-size: 12px;
                color: #6c757d;
                background-color: #e9ecef;
                padding: 2px 8px;
                border-radius: 12px;
            `;

            wordSection.appendChild(wordText);
            wordSection.appendChild(reasonText);
            suggestionItem.appendChild(wordSection);

            suggestionItem.addEventListener('mouseenter', () => {
                suggestionItem.style.backgroundColor = '#e9ecef';
            });
            suggestionItem.addEventListener('mouseleave', () => {
                suggestionItem.style.backgroundColor = 'transparent';
            });
            suggestionItem.addEventListener('click', (event) => {
                // Prevent event from bubbling up
                event.stopPropagation();
                event.preventDefault();
                
                if (input) {
                    const regex = new RegExp(`\\b${suggestion.original}\\b`, 'gi');
                    let newText = input.textContent || input.value;
                    newText = newText.replace(regex, suggestion.replacement);
                    
                    if (input.contentEditable === 'true') {
                        input.textContent = newText;
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                    } else {
                        input.value = newText;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    
                    // Store the masked text
                    input.dataset.maskedText = newText;
                    
                    // Remove this suggestion item
                    if (suggestionItem && suggestionItem.parentNode) {
                        suggestionItem.parentNode.removeChild(suggestionItem);
                    }

                    // Update the replace all button count
                    const remainingSuggestions = container.querySelectorAll('.suggestion-item');
                    const replaceAllButton = container.querySelector('.replace-all-button');
                    if (replaceAllButton) {
                        replaceAllButton.textContent = `Replace All Words (${remainingSuggestions.length})`;
                    }

                    // Only remove container if no suggestions left
                    if (remainingSuggestions.length === 0) {
                        if (container && container.parentNode) {
                            container.parentNode.removeChild(container);
                        }
                        // Clear stored suggestions when all are used
                        delete input.dataset.currentSuggestions;
                        delete input.dataset.currentContainer;
                    }
                    
                    input.focus();
                }
            });

            container.appendChild(suggestionItem);
        });

        return container;
    }
    
    // Function to create a masking table UI
    function createMaskingTableUI(maskingTable, input) {
        // Create container
        const container = document.createElement('div');
        container.id = 'masking-table-container';
        container.style.cssText = `
            position: fixed;
            z-index: 999999;
            background: #ffffff;
            border: 1px solid #d9d9e3;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 8px 0;
            max-height: 400px;
            overflow-y: auto;
            min-width: 300px;
            min-height: 30px;
            display: block;
            visibility: visible;
            opacity: 1;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 16px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Masking Recommendations';
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
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        header.appendChild(title);
        header.appendChild(closeButton);
        container.appendChild(header);

        // Add table content
        const tableContent = document.createElement('div');
        tableContent.style.cssText = `
            padding: 12px 16px;
            overflow-x: auto;
        `;
        
        // Convert markdown table to HTML
        const tableHTML = convertMarkdownTableToHTML(maskingTable);
        tableContent.innerHTML = tableHTML;
        
        container.appendChild(tableContent);
        
        // Add "Apply All Replacements" button
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply All Replacements';
        applyButton.style.cssText = `
            margin: 12px 16px;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: block;
            width: calc(100% - 32px);
            box-sizing: border-box;
        `;
        
        applyButton.addEventListener('click', () => {
            if (input) {
                // Extract replacements from the table
                const replacements = extractReplacementsFromTable(maskingTable);
                
                // Apply all replacements
                let newText = input.textContent || input.value;
                replacements.forEach(replacement => {
                    const { original, replacement: replacementText } = replacement;
                    newText = replaceWord(newText, original, replacementText);
                });
                
                // Update the input
                if (input.contentEditable === 'true') {
                    input.textContent = newText;
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                } else {
                    input.value = newText;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                // Remove the container
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                
                input.focus();
            }
        });
        
        container.appendChild(applyButton);
        
        return container;
    }
    
    // Function to convert markdown table to HTML
    function convertMarkdownTableToHTML(markdownTable) {
        const lines = markdownTable.split('\n');
        if (lines.length < 3) return markdownTable;
        
        let html = '<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">';
        
        // Add header row
        const headerCells = lines[0].split('|').filter(cell => cell.trim() !== '');
        html += '<thead><tr>';
        headerCells.forEach(cell => {
            html += `<th style="border:1px solid #dee2e6; padding:8px; text-align:left; background-color:#f8f9fa;">${cell.trim()}</th>`;
        });
        html += '</tr></thead>';
        
        // Skip separator row (line 1)
        
        // Add data rows
        html += '<tbody>';
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').filter(cell => cell.trim() !== '');
            if (cells.length === headerCells.length) {
                html += '<tr>';
                cells.forEach(cell => {
                    html += `<td style="border:1px solid #dee2e6; padding:8px;">${cell.trim()}</td>`;
                });
                html += '</tr>';
            }
        }
        html += '</tbody></table>';
        
        return html;
    }
    
    // Function to extract replacements from markdown table
    function extractReplacementsFromTable(markdownTable) {
        const lines = markdownTable.split('\n');
        if (lines.length < 3) return [];
        
        const replacements = [];
        
        // Skip header and separator rows
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').filter(cell => cell.trim() !== '');
            if (cells.length >= 3) {
                const original = cells[0].trim();
                const replacement = cells[2].trim();
                
                replacements.push({
                    original,
                    replacement
                });
            }
        }
        
        return replacements;
    }

    // Function to show masking analysis for the selected text
    async function showMaskingAnalysis(selectedText, input) {
        try {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'masking-loading-indicator';
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
                <div style="width: 30px; height: 30px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loadingIndicator);

            // Analyze the text
            const analysisResult = await analyzeTextForMasking(selectedText);

            // Remove loading indicator
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }

            if (analysisResult) {
                // Create and show the UI
                const ui = createMaskingAnalysisUI(analysisResult, input);
                
                // Position the container
                positionContainer(ui, input);
                
                // Add the container to the document
                document.body.appendChild(ui);
            } else {
                alert('Error analyzing text. Please make sure the Python server is running.');
            }
        } catch (error) {
            console.error('Error showing masking analysis:', error);
            alert('Error analyzing text. Please make sure the Python server is running.');
        }
    }
    
    // Function to show masking table for the selected text
    async function showMaskingTable(selectedText, input) {
        try {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'masking-loading-indicator';
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
                <div style="width: 30px; height: 30px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loadingIndicator);

            // Get masked words
            const maskingTable = await getMaskedWords(selectedText);

            // Remove loading indicator
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }

            if (maskingTable) {
                // Create and show the UI
                const ui = createMaskingTableUI(maskingTable, input);
                
                // Position the container
                positionContainer(ui, input);
                
                // Add the container to the document
                document.body.appendChild(ui);
            } else {
                alert('Error analyzing text. Please make sure the Python server is running.');
            }
        } catch (error) {
            console.error('Error showing masking table:', error);
            alert('Error analyzing text. Please make sure the Python server is running.');
        }
    }
    
    // More flexible way to find the ChatGPT input area
    const findInputField = () => {
        // Try multiple selectors to find any input area
        return document.querySelector('div[contenteditable="true"]') || 
               document.querySelector('textarea, input[type="text"], input[type="search"], input[type="email"], input[type="password"]');
    };
  
    // Observer configuration
    const observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    };
  
    // Create a container for the suggestions
    let suggestionContainer = null;
    
    // Mutation Observer to handle dynamic loading
    const observer = new MutationObserver(() => {
      const input = findInputField();
      if (input && !input.dataset.suggestionListenerAdded) {
        setupSuggestions(input);
        input.dataset.suggestionListenerAdded = 'true';
      }
    });
  
    // Start observing
    observer.observe(document.body, observerConfig);
  
    // Add debounce function
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    function setupSuggestions(input) {
      console.log('Input found', input);
  
      // Debounce the input handler
      const debouncedHandleInput = debounce(() => {
        // Check if input exists and has a value property
        if (!input) {
          console.error('Input element not found');
          return;
        }

        // Get text value safely
        const text = input.textContent || input.value || '';
        const cursorPosition = input.selectionStart;
        
        // Check if we already have a container with suggestions
        const existingContainer = document.getElementById('masking-analysis-container');
        
        // If there's no text, close the container if it exists
        if (!text.trim()) {
          if (existingContainer && existingContainer.parentNode) {
            existingContainer.parentNode.removeChild(existingContainer);
            // Clear stored suggestions
            delete input.dataset.currentSuggestions;
            delete input.dataset.currentContainer;
          }
          return;
        }

        // If we have a container, don't remove it
        if (existingContainer) {
          return;
        }

        // Check if this text was already analyzed and closed
        const lastAnalyzedText = input.dataset.lastAnalyzedText;
        if (lastAnalyzedText === text) {
          return;
        }

        // Check if this text is already masked
        const maskedText = input.dataset.maskedText;
        if (maskedText === text) {
          return;
        }

        // Store the text being analyzed
        const textBeingAnalyzed = text;
        
        // Start background analysis without showing loading indicator
        analyzeTextForMasking(text).then(analysisResult => {
          // Check if the text has changed during analysis
          const currentText = input.textContent || input.value || '';
          if (currentText !== textBeingAnalyzed) {
            console.log('Text changed during analysis, ignoring results');
            return;
          }

          if (analysisResult && analysisResult.table_markdown) {
            // Store the suggestions in the input's dataset
            input.dataset.currentSuggestions = JSON.stringify(analysisResult);
            
            // Create and show the suggestion container
            const container = createMaskingAnalysisUI(analysisResult, input);
            document.body.appendChild(container);
            positionContainer(container, input);
          }
        }).catch(error => {
          console.error('Error analyzing text:', error);
        });
      }, 500); // 500ms delay
  
      // Event listeners
      input.addEventListener('input', debouncedHandleInput);
      input.addEventListener('paste', debouncedHandleInput);
      input.addEventListener('change', debouncedHandleInput);
      input.addEventListener('keyup', debouncedHandleInput);
      input.addEventListener('keydown', debouncedHandleInput);
      
      // Also trigger on focus to check if there's already content
      input.addEventListener('focus', () => {
        // If we have stored suggestions, show them
        const storedSuggestions = input.dataset.currentSuggestions;
        if (storedSuggestions) {
          try {
            const analysisResult = JSON.parse(storedSuggestions);
            const container = createMaskingAnalysisUI(analysisResult, input);
            document.body.appendChild(container);
            positionContainer(container, input);
          } catch (error) {
            console.error('Error restoring suggestions:', error);
            debouncedHandleInput();
          }
        } else {
          debouncedHandleInput();
        }
      });
  
      // Hide suggestions when clicking outside
      document.addEventListener('click', (e) => {
        // Check if the click is on a suggestion item or the container itself
        const isSuggestionClick = e.target.closest('.suggestion-item') !== null;
        const isContainerClick = e.target.closest('#masking-analysis-container') !== null;
        const isReplaceAllClick = e.target.closest('.replace-all-button') !== null;
        const isCloseButtonClick = e.target.closest('.close-button') !== null;
        
        // Only close if clicking outside the container and not on a suggestion
        if (suggestionContainer && !isSuggestionClick && !isContainerClick && !isReplaceAllClick && !isCloseButtonClick && e.target !== input) {
          suggestionContainer.parentNode.removeChild(suggestionContainer);
          suggestionContainer = null;
        }
      });
      
      // Initial check for content
      debouncedHandleInput();
    }
  
    function createSuggestionItem(text, original, replacement) {
      console.log("Appending suggestion...");
      const item = document.createElement('div');
      item.textContent = text;
      item.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        font-size: 0.9em;
        color: #000000;
        min-height: 20px;
        display: block;
        width: 100%;
        box-sizing: border-box;
      `;
      
      // Store word information as data attributes
      item.dataset.original = original;
      item.dataset.replacement = replacement;
  
      item.addEventListener('mouseenter', () => {
        item.style.background = '#f7f7f8';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });
      
      item.addEventListener('click', () => {
        const input = findInputField();
        if (input) {
          const original = item.dataset.original;
          const replacement = item.dataset.replacement;
          
          // Get the current value
          const currentValue = input.textContent || input.value;
          
          // Replace all occurrences of this specific word
          const newValue = replaceWord(currentValue, original, replacement);
          
          if (input.contentEditable === 'true') {
            input.textContent = newValue;
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
          } else {
            input.value = newValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          // Remove the current suggestion container
          if (suggestionContainer && suggestionContainer.parentNode) {
            suggestionContainer.parentNode.removeChild(suggestionContainer);
            suggestionContainer = null;
          }
          
          // Re-create the suggestion container by calling handleInput
          // This will check the current text and create a new container if needed
          setTimeout(() => {
            // Find the input field again to make sure we have the latest value
            const updatedInput = findInputField();
            if (updatedInput) {
              // Get the current value
              const updatedValue = updatedInput.textContent || updatedInput.value;
              
              // Get all replacements that match the current text
              const replacements = getReplacements(updatedValue);
              
              if (replacements.length > 0) {
                // Count total occurrences across all words
                let totalOccurrences = 0;
                replacements.forEach(replacement => {
                  const { original } = replacement;
                  const regex = new RegExp(`\\b${original}\\b`, 'gi');
                  const matches = [...updatedValue.matchAll(regex)];
                  totalOccurrences += matches.length;
                });
                
                if (totalOccurrences > 0) {
                  // Create a new container for suggestions
                  suggestionContainer = document.createElement('div');
                  suggestionContainer.id = 'suggestion-container';
                  suggestionContainer.style.cssText = `
                    position: fixed;
                    z-index: 999999;
                    background: #ffffff;
                    border: 1px solid #d9d9e3;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 8px 0;
                    max-height: 200px;
                    overflow-y: auto;
                    min-width: 150px;
                    min-height: 30px;
                    display: block;
                    visibility: visible;
                    opacity: 1;
                  `;
                  
                  // Add a close button
                  const closeButton = document.createElement('div');
                  closeButton.innerHTML = '&times;';
                  closeButton.style.cssText = `
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    color: #666;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                  `;
                  
                  closeButton.addEventListener('mouseenter', () => {
                    closeButton.style.background = '#f0f0f0';
                    closeButton.style.color = '#000';
                  });
                  
                  closeButton.addEventListener('mouseleave', () => {
                    closeButton.style.background = 'transparent';
                    closeButton.style.color = '#666';
                  });
                  
                  closeButton.addEventListener('click', () => {
                    if (suggestionContainer && suggestionContainer.parentNode) {
                      suggestionContainer.parentNode.removeChild(suggestionContainer);
                      suggestionContainer = null;
                    }
                  });
                  
                  suggestionContainer.appendChild(closeButton);
                  
                  // Add the global "Replace All" button
                  const globalReplaceAllButton = document.createElement('div');
                  globalReplaceAllButton.textContent = `Replace All Words (${totalOccurrences})`;
                  globalReplaceAllButton.style.cssText = `
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 0.9em;
                    color: #000000;
                    min-height: 20px;
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                    background-color: #e0e0e0;
                    border-bottom: 1px solid #d9d9e3;
                    font-weight: bold;
                    margin-top: 5px;
                  `;
                  
                  globalReplaceAllButton.addEventListener('mouseenter', () => {
                    globalReplaceAllButton.style.background = '#d0d0d0';
                  });
                  
                  globalReplaceAllButton.addEventListener('mouseleave', () => {
                    globalReplaceAllButton.style.background = '#e0e0e0';
                  });
                  
                  globalReplaceAllButton.addEventListener('click', () => {
                    const input = findInputField();
                    if (input) {
                      const currentValue = input.textContent || input.value;
                      
                      // Replace all configured words at once
                      let newValue = currentValue;
                      replacements.forEach(replacement => {
                        const { original, replacement: replacementText } = replacement;
                        newValue = replaceWord(newValue, original, replacementText);
                      });
                      
                      if (input.contentEditable === 'true') {
                        input.textContent = newValue;
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                      } else {
                        input.value = newValue;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                      
                      // Remove the suggestion container
                      if (suggestionContainer && suggestionContainer.parentNode) {
                        suggestionContainer.parentNode.removeChild(suggestionContainer);
                        suggestionContainer = null;
                      }
                      
                      input.focus();
                    }
                  });
                  
                  suggestionContainer.appendChild(globalReplaceAllButton);
                  
                  // Add a separator
                  const separator = document.createElement('div');
                  separator.style.cssText = `
                    height: 1px;
                    background-color: #d9d9e3;
                    margin: 4px 0;
                  `;
                  suggestionContainer.appendChild(separator);
                  
                  // Process each replacement
                  replacements.forEach(replacement => {
                    const { original, replacement: replacementText } = replacement;
                    
                    // Find all occurrences of the original word
                    const regex = new RegExp(`\\b${original}\\b`, 'gi');
                    const matches = [...updatedValue.matchAll(regex)];
                    
                    if (matches.length > 0) {
                      console.log(`Found ${matches.length} occurrences of '${original}' in input`);
                      
                      // Create a suggestion for this word type
                      const suggestion = createSuggestionItem(
                        `${original} → ${replacementText} (${matches.length})`, 
                        original,
                        replacementText
                      );
                      suggestionContainer.appendChild(suggestion);
                    }
                  });
                  
                  // Position the container
                  positionContainer(suggestionContainer, updatedInput);
                  
                  // Add the container to the document
                  document.body.appendChild(suggestionContainer);
                }
              }
            }
          }, 50);
          
          input.focus();
        }
      });
      
      return item;
    }
  
    function positionContainer(container, input) {
      try {
        const rect = input.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
    
        console.log('Container Position:', rect, spaceBelow);
        
        if (spaceBelow > 200) {
          // Position below
          container.style.top = `${rect.bottom + window.scrollY + 5}px`;
          container.style.left = `${rect.left + window.scrollX}px`;
          container.style.width = `${Math.max(rect.width, 150)}px`; // Ensure minimum width
        } else {
          // Position above
          container.style.bottom = `${window.innerHeight - rect.top + window.scrollY + 5}px`;
          container.style.left = `${rect.left + window.scrollX}px`;
          container.style.width = `${Math.max(rect.width, 150)}px`; // Ensure minimum width
        }
        
        // Force a reflow to ensure the container is rendered
        void container.offsetWidth;
      } catch (error) {
        console.error("Error positioning container:", error);
        // Fallback positioning
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.width = "300px";
      }
    }
  
    // Initial check in case the input is already loaded
    const initialInput = findInputField();
    if (initialInput) {
      setupSuggestions(initialInput);
      initialInput.dataset.suggestionListenerAdded = 'true';
    }
    
    // Periodic check for input field (in case it's loaded dynamically)
    setInterval(() => {
      const input = findInputField();
      if (input && !input.dataset.suggestionListenerAdded) {
        setupSuggestions(input);
        input.dataset.suggestionListenerAdded = 'true';
      }
    }, 2000);
  });