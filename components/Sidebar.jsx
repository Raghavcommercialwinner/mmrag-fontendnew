import React, { useState } from 'react';

const Sidebar = () => {
  const [chats, setChats] = useState(
    parseInt(localStorage.getItem('totalChats') || '5')
  );

  const selectedChat = parseInt(localStorage.getItem('selectedChat') || '0');

  const handleChatClick = (chatIndex) => {
    localStorage.setItem('selectedChat', chatIndex);
    window.location.reload();
  };

  const handleAddChat = () => {
    const newChatCount = chats + 1;
    setChats(newChatCount);
    localStorage.setItem('totalChats', newChatCount);
  };

  return (
    <aside className="h-screen w-[250px] bg-gray-100 dark:bg-[#1e1e1e] border-r border-gray-300 dark:border-gray-700 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">My Chats</h2>
        <button
          onClick={handleAddChat}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xl w-8 h-8 rounded-full flex items-center justify-center transition-all"
          title="Add new chat"
        >
          +
        </button>
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {Array.from({ length: chats }, (_, i) => (
          <button
            key={i}
            onClick={() => handleChatClick(i)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-medium
              ${
                i === selectedChat
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
          >
            Chat {i + 1}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="text-xs text-center text-gray-400 dark:text-gray-500 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        click + to start a new chat
      </div>
    </aside>
  );
};

export default Sidebar;
