import React, { useState } from 'react';

const Chatbox = () => {
  const selectedChat = localStorage.getItem('selectedChat') || '0';

  const [file, setFile] = useState(null);
  const [fileSubmitted, setFileSubmitted] = useState(
    localStorage.getItem(`fileSubmitted_${selectedChat}`) === 'true'
  );
  const [query, setQuery] = useState('');
  const [api, setApi] = useState('');
  const [apiSubmitted, setApiSubmitted] = useState(
    localStorage.getItem(`apiSubmitted_${selectedChat}`) === 'true'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState(
    JSON.parse(localStorage.getItem(`chatHistory_${selectedChat}`)) || []
  );

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleApiSubmit = async () => {
    if (api.trim() !== '') {
      try {
        const res = await fetch('http://127.0.0.1:8000/upload-key/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: api }),
        });
        const data = await res.json();
        alert(data.message || 'API key accepted.');
        setApiSubmitted(true);
        localStorage.setItem(`apiSubmitted_${selectedChat}`, 'true');
        setApi('');
      } catch (error) {
        console.error("API Error:", error);
        alert("Failed to submit API key.");
      }
    } else {
      alert("Please enter your API key.");
    }
  };

  const handleFileSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);

      try {
        const res = await fetch('http://127.0.0.1:8000/upload/', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        alert(data.message);
        setFileSubmitted(true);
        localStorage.setItem(`fileSubmitted_${selectedChat}`, 'true');
      } catch (error) {
        console.error("File Upload Error:", error);
        alert("Failed to upload file.");
      } finally {
        setIsUploading(false);
      }
    } else {
      alert("Please select a file first.");
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      alert("Please enter a query.");
      return;
    }

    const userMessage = { sender: 'user', text: query };

    try {
      const res = await fetch('http://127.0.0.1:8000/query/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      const botMessage = {
        sender: 'bot',
        text: data.answer || "No response received.",
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
    <div className="flex flex-col min-h-screen w-full font-sans bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">

      {/* Chat Display Area */}
      <div className="flex-grow px-6 py-8 overflow-y-auto space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Conversation</h2>
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-5 py-3 rounded-xl shadow text-base whitespace-pre-wrap 
                ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'}
              `}>
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
        <h1 className="text-pink-600 dark:text-pink-400 text-2xl font-bold mb-6 text-center tracking-wide">
          Enter API Key, Upload File, and Ask Query
        </h1>

        <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">

          {/* Query Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`flex-1 px-4 h-12 text-lg rounded-xl border transition shadow-sm focus:outline-none ${
                fileSubmitted && apiSubmitted
                  ? 'bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 cursor-not-allowed'
              }`}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`px-6 h-12 rounded-xl text-lg font-semibold transition-all shadow ${
                fileSubmitted && apiSubmitted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Query
            </button>
          </div>

          {/* API Key Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter your API key (groq or OpenAI only)"
              value={api}
              onChange={(e) => setApi(e.target.value)}
              className="flex-1 px-4 h-12 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <button
              onClick={handleApiSubmit}
              className="px-6 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-lg font-semibold transition-all shadow"
            >
              Submit API Key
            </button>
          </div>

          {/* File Upload */}
          <div className="flex gap-3 items-center">
            <label className="flex-1 flex items-center justify-center h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-base rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <span className="truncate">Upload File</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx,.doc,.md"
                className="hidden"
              />
            </label>
            {isUploading ? (
              <div className="flex items-center justify-center h-12 w-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-green-600"></div>
              </div>
            ) : (
              <button
                onClick={handleFileSubmit}
                className="px-6 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold transition-all shadow"
              >
                Submit File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
