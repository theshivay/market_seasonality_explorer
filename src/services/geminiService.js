// Gemini AI Service for Finance Chatbot
// Uses actual Google Gemini API - no default responses

class GeminiFinanceService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async generateFinanceResponse(userMessage) {
    // Enhanced markdown prompt
    const financePrompt = `You are a finance expert. Answer this question briefly and professionally: "${userMessage}"
    
    Format your response using markdown:
    - Use emojis for visual appeal
    - Bold text with **text** for headings
    - Bullet points with - or • for lists
    - Clear sections with line breaks
    - Include 1-2 specific examples with real numbers
    - Keep under 150 words
    - Make it visually appealing and easy to scan
    
    Focus on actionable, practical advice only. Return properly formatted markdown.`;

    try {
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
        console.log("GEMINI_API_KEY : ",import.meta.env.VITE_GEMINI_API_KEY);
        throw new Error('API key not configured');
      }

      // Updated API call format for Gemini
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: financePrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Response Error:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          content: data.candidates[0].content.parts[0].text,
          source: 'gemini'
        };
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Short error messages
      if (error.message.includes('API key not configured')) {
        return {
          content: `🔑 **API Key Required**

Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey) and add to .env file:
\`VITE_GEMINI_API_KEY=your_key\``,
          source: 'config_error'
        };
      }
      
      if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        return {
          content: `🔑 **Invalid API Key**

Get a new key from [Google AI Studio](https://aistudio.google.com/app/apikey) and update your .env file.`,
          source: 'invalid_key'
        };
      }
      
      return {
        content: `❌ **Service Unavailable**

AI service is down. Please try again later.`,
        source: 'error'
      };
    }
  }
}

export default new GeminiFinanceService();
