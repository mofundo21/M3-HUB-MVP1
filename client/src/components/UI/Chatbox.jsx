import React, { useState, useEffect, useRef, useCallback } from 'react';

const QUICK_MESSAGES = ['lfg', 'portal hop', 'glitch gang', 'recode this', 'spawn'];
const CHAR_LIMIT = 50;
const TYPING_DEBOUNCE = 300;

export default function Chatbox({ roomRef, typingUsers = new Map() }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      right: 12,
      width: 'min(320px, calc(100vw - 24px))',
      maxHeight: 400,
      background: 'rgba(0,0,0,0.8)',
      border: '1px solid #00ffff',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      fontFamily: "'Courier New', monospace",
      color: '#00ffff',
    }}>
      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        fontSize: 11,
        minHeight: 100,
        maxHeight: 200,
        borderBottom: '1px solid #003333',
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
            No messages yet
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 6 }}>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                {msg.username}
              </span>
              <span style={{ color: '#888', fontSize: 9, marginLeft: 4 }}>
                [{msg.pkg}]
              </span>
              <div style={{ color: '#00ffff', wordWrap: 'break-word', marginLeft: 4 }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingList.length > 0 && (
        <div style={{
          padding: '4px 12px',
          fontSize: 10,
          color: '#00aa88',
          borderBottom: '1px solid #003333',
          fontStyle: 'italic',
        }}>
          {typingList.length === 1 ? 'User is typing...' : 'Multiple users typing...'}
        </div>
      )}

      {/* Quick messages */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '8px 12px',
        flexWrap: 'wrap',
        borderBottom: '1px solid #003333',
      }}>
        {QUICK_MESSAGES.map((msg) => (
          <button
            key={msg}
            onClick={() => handleQuickMessage(msg)}
            style={{
              height: 35,
              padding: '0 8px',
              background: 'rgba(0,20,20,0.8)',
              border: '1px solid #00ffff',
              color: '#00ffff',
              borderRadius: 20,
              fontSize: 10,
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
              e.target.style.background = 'rgba(0,20,20,0.8)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '8px 12px',
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type message..."
          maxLength={CHAR_LIMIT}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #00ffff',
            borderRadius: 4,
            color: '#00ffff',
            padding: '6px 8px',
            fontSize: 11,
            fontFamily: "'Courier New', monospace",
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#00ff88';
            e.target.style.boxShadow = '0 0 8px rgba(0,255,136,0.3)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#00ffff';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '6px 12px',
            background: 'rgba(0,255,255,0.1)',
            border: '1px solid #00ffff',
            color: '#00ffff',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "'Courier New', monospace",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.2)';
            e.target.style.boxShadow = '0 0 8px #00ffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Send
        </button>
      </div>

      {/* Char counter */}
      <div style={{
        fontSize: 9,
        color: '#666',
        padding: '4px 12px',
        textAlign: 'right',
      }}>
        {inputValue.length}/{CHAR_LIMIT}
      </div>
    </div>
  );
}
