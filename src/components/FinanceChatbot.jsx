import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Chat,
  Close,
  Send,
  SmartToy,
  TrendingUp,
  AccountBalance,
  Analytics,
} from '@mui/icons-material';
import geminiService from '../services/geminiService';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FinanceChatbot = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '👋 Hello! I\'m your Finance Assistant powered by Google Gemini. I can help you with:\n\n• Market analysis and trends\n• Investment strategies\n• Financial calculations\n• Trading insights\n• Economic indicators\n\nWhat would you like to know about finance today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced Gemini API call using service
  const callGeminiAPI = async (message) => {
    try {
      const response = await geminiService.generateFinanceResponse(message);
      return response;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        content: `❌ **Service Temporarily Unavailable**

I'm currently experiencing technical difficulties. Please try again in a moment.

**Common Topics I Can Help With:**
• Market analysis and trends
• Investment strategies and portfolio management
• Trading insights and risk management
• Financial calculations and formulas

*Tip*: Try asking about specific topics like "market trends" or "portfolio allocation".`,
        examples: ['market analysis', 'investment strategies', 'trading insights']
      };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await callGeminiAPI(inputValue);
      
      const botMessage = {
        type: 'bot',
        content: response.content,
        examples: response.examples,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage = {
        type: 'bot',
        content: '❌ Sorry, I encountered an error. Please try again later or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const suggestionChips = [
    'Market trends today',
    'Portfolio allocation',
    'Calculate compound interest',
    'Trading strategies',
    'Risk management',
    'Technical analysis'
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
          }}
        >
          <Chat />
        </Fab>
      </Zoom>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.background.paper,
            maxHeight: '80vh',
            position: 'fixed',
            bottom: 80,
            right: 24,
            margin: 0,
            width: 400,
            maxWidth: '90vw',
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy />
            <Typography variant="h6" fontWeight={600}>
              Finance Assistant
            </Typography>
            <Chip
              label="Powered by Gemini"
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Messages */}
        <DialogContent
          sx={{
            p: 0,
            height: 400,
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box sx={{ p: 2, pb: 0 }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    maxWidth: '85%',
                    backgroundColor: message.type === 'user' 
                      ? theme.palette.primary.main 
                      : theme.palette.background.paper,
                    color: message.type === 'user' 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.primary,
                    borderRadius: message.type === 'user' 
                      ? '18px 18px 4px 18px' 
                      : '18px 18px 18px 4px',
                  }}
                >
                  <Box
                    sx={{
                      '& p': { margin: '0.5rem 0', lineHeight: 1.5 },
                      '& strong': { fontWeight: 'bold', color: theme.palette.primary.main },
                      '& em': { fontStyle: 'italic' },
                      '& ul': { paddingLeft: '1.5rem', margin: '0.5rem 0' },
                      '& li': { 
                        marginBottom: '0.25rem',
                        '&::marker': { color: theme.palette.primary.main }
                      },
                      '& h1, & h2, & h3': { 
                        fontWeight: 'bold', 
                        margin: '0.5rem 0',
                        color: theme.palette.primary.main 
                      },
                      fontSize: '0.875rem',
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                  
                  {message.examples && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.examples.map((example, idx) => (
                        <Chip
                          key={idx}
                          label={example}
                          size="small"
                          onClick={() => setInputValue(example)}
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: theme.palette.primary.light,
                              color: 'white',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                      fontSize: '0.7rem',
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '18px 18px 18px 4px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </DialogContent>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Try these suggestions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {suggestionChips.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  onClick={() => setInputValue(suggestion)}
                  sx={{
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Ask me about finance, markets, trading..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              color="primary"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabled,
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FinanceChatbot;
