import { useState } from 'react';
import ChatInterface from './ChatInterface';
import { motion } from 'framer-motion';

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-[#B22222] text-black p-3 rounded-full shadow-lg hover:bg-[#8B1A1A] transition focus:outline-none"
      >
        <img src="/bittu.png" alt="Chat Logo" className="h-12 w-12" />
      </button>

      {isOpen && (
        <motion.div
          className="fixed bottom-16 right-4 w-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <ChatInterface onClose={toggleChat} />
        </motion.div>
      )}
    </div>
  );
}

export default ChatBox;