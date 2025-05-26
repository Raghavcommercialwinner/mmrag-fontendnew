import React, { useState } from 'react';

const Chatbox = () => {
  const selectedChat = localStorage.getItem('selectedChat') || '0';
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState(
    JSON.parse(localStorage.getItem(`chatHistory_${selectedChat}`)) || []
  );

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      alert("Please enter a query.");
      return;
    }
    const userMessage = { sender: 'user', text: query };
    try {
      const res = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: query }),
      });
      const data = await res.json();
      const botMessage = {
        sender: 'bot',
        text: data.response || "No response received.",
        sources: data.sources ? data.sources.join(', ') : "No sources available.",
      };
      const updatedChat = [...chatHistory, userMessage, botMessage];
      setChatHistory(updatedChat);
      localStorage.setItem(`chatHistory_${selectedChat}`, JSON.stringify(updatedChat));
      setQuery('');
    } catch (error) {
      console.error("Query Error:", error);
      const errorMessage = {
        sender: 'bot',
        text: "Error: Could not get response.",
      };
      const updatedChat = [...chatHistory, userMessage, errorMessage];
      setChatHistory(updatedChat);
      localStorage.setItem(`chatHistory_${selectedChat}`, JSON.stringify(updatedChat));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Chat Display Area */}
      <div className="flex-grow px-6 py-8 overflow-y-auto space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Conversation</h2>
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-xl shadow text-base whitespace-pre-wrap 
                  ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'dark:bg: bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'}
                `}
              >
                {msg.text}
                {msg.sender === 'bot' && msg.sources && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-xs uppercase">Sources:</span> {msg.sources}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div> 
      {/* Input Section */}
      <div className="flex flex-col items-center justify-end py-8 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-inner rounded-t-3xl border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
          {/* Always-enabled Query Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 h-12 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              onClick={handleQuerySubmit}
              className="px-6 h-12 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow cursor-pointer"
            >
              Submit Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
