import React, { useState, useEffect, useRef, useCallback } from 'react';

const QUICK_MESSAGES = ['lfg', 'portal hop', 'glitch gang', 'recode this', 'spawn'];
const CHAR_LIMIT = 50;
const TYPING_DEBOUNCE = 300;

export default function Chatbox({ roomRef, typingUsers = new Map() }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for chat messages from room
  useEffect(() => {
    if (!roomRef?.current) return;

    const handleChatMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    roomRef.current.onMessage('chatMessage', handleChatMessage);

    return () => {
      // Cleanup listener
    };
  }, [roomRef]);

  // Handle typing with debounce
  const handleInputChange = useCallback((e) => {
    const value = e.target.value.slice(0, CHAR_LIMIT);
    setInputValue(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      if (roomRef?.current) {
        roomRef.current.send('typing', { isTyping: true });
      }
    }

    // Clear and reset debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If text was cleared, send typing stop
    if (value.length === 0) {
      setIsTyping(false);
      if (roomRef?.current) {
        roomRef.current.send('typing', { isTyping: false });
      }
    } else {
      // Reset the idle timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (roomRef?.current) {
          roomRef.current.send('typing', { isTyping: false });
        }
      }, TYPING_DEBOUNCE + 2000);
    }
  }, [isTyping, roomRef]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !roomRef?.current) return;

    const trimmed = text.slice(0, CHAR_LIMIT);
    roomRef.current.send('chat', { text: trimmed });

    setInputValue('');
    setIsTyping(false);
    if (roomRef?.current) {
      roomRef.current.send('typing', { isTyping: false });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [roomRef]);

  const handleSend = useCallback(() => {
    sendMessage(inputValue);
  }, [inputValue, sendMessage]);

  const handleQuickMessage = useCallback((msg) => {
    sendMessage(msg);
  }, [sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const typingList = Array.from(typingUsers.entries())
    .filter(([_, isTyping]) => isTyping)
    .map(([sessionId, _]) => sessionId);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const lastMsg = messages[messages.length - 1];

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 10 : 20,
      right: isMobile ? 10 : 20,
      fontFamily: "'Courier New', monospace",
      zIndex: 100,
      transition: 'all 0.3s ease',
    }}>
      {/* Collapsed state */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(0,255,255,0.15)',
            border: '2px solid #00ffff',
            color: '#00ffff',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 0 20px rgba(0,255,255,0.2)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.25)';
            e.target.style.boxShadow = '0 0 30px rgba(0,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.15)';
            e.target.style.boxShadow = '0 0 20px rgba(0,255,255,0.2)';
          }}
          title="Open chat"
        >
          💬
        </button>
      )}

      {/* Expanded state */}
      {!isCollapsed && (
        <div style={{
          width: isMobile ? 'min(90vw, 280px)' : 280,
          maxHeight: isMobile ? '50vh' : 420,
          background: 'rgba(0,0,0,0.9)',
          border: '1px solid #00ffff',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          color: '#00ffff',
          boxShadow: '0 0 30px rgba(0,255,255,0.2)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            borderBottom: '1px solid #003333',
            fontSize: 11,
            fontWeight: 'bold',
          }}>
            <span>CHAT</span>
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#00ffff',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
            fontSize: 10,
            minHeight: 80,
            maxHeight: 160,
            borderBottom: '1px solid #003333',
          }}>
            {messages.length === 0 ? (
              <div style={{ color: '#555', fontSize: 9, textAlign: 'center', marginTop: 15 }}>
                no messages
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 5, lineHeight: 1.3 }}>
                  <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: 9 }}>
                    {msg.username}
                  </span>
                  <div style={{ color: '#00ffff', fontSize: 9, marginLeft: 2 }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing */}
          {typingList.length > 0 && (
            <div style={{
              padding: '4px 12px',
              fontSize: 9,
              color: '#00aa88',
              borderBottom: '1px solid #003333',
              fontStyle: 'italic',
            }}>
              typing...
            </div>
          )}

          {/* Quick buttons - more compact */}
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '6px 8px',
            flexWrap: 'wrap',
            borderBottom: '1px solid #003333',
            justifyContent: 'center',
          }}>
            {QUICK_MESSAGES.slice(0, 3).map((msg) => (
              <button
                key={msg}
                onClick={() => handleQuickMessage(msg)}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(0,20,20,0.6)',
                  border: '1px solid #00ffff',
                  color: '#00ffff',
                  borderRadius: 12,
                  fontSize: 8,
                  fontFamily: "'Courier New', monospace",
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0,40,40,0.9)';
                  e.target.style.boxShadow = '0 0 8px #00ffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0,20,20,0.6)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '6px 8px',
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="msg..."
              maxLength={CHAR_LIMIT}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid #00ffff',
                borderRadius: 4,
                color: '#00ffff',
                padding: '4px 6px',
                fontSize: 9,
                fontFamily: "'Courier New', monospace",
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00ff88';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#00ffff';
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '4px 8px',
                background: 'rgba(0,255,255,0.1)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                borderRadius: 4,
                fontSize: 9,
                fontFamily: "'Courier New', monospace",
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,255,255,0.1)';
              }}
            >
              ↵
            </button>
          </div>

          {/* Char counter */}
          <div style={{
            fontSize: 8,
            color: '#555',
            padding: '2px 8px',
            textAlign: 'right',
          }}>
            {inputValue.length}/{CHAR_LIMIT}
          </div>
        </div>
      )}
    </div>
  );
}
