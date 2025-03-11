import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { sendMessageToBittu } from "../../services/api";

function ChatInterface({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);

  // Create a new session ID when the component mounts or the page reloads
  useEffect(() => {
    // Generate a random session ID
    const newSessionId = Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Clear messages when component mounts (page reload)
    setMessages([]);
    
    // Optional: Add an initial bot greeting
    // const welcomeMessage = {
    //   sender: "Bittu",
    //   senderName: "Bittu",
    //   message: "Hi there! I'm Bittu, your virtual assistant. How can I help you today?",
    //   timestamp: new Date().toISOString(),
    // };
    // setMessages([welcomeMessage]);
    
    // Add event listener for page unload/reload
    const handleBeforeUnload = () => {
      // You could send a request to clear the session on the backend
      // This is optional and might not always execute depending on browser behavior
      try {
        fetch(`https://desihatti-production.up.railway.app/api/chat/clear?sessionId=${sessionId}`, {
          method: 'POST',
          keepalive: true // This helps ensure the request completes even during page unload
        });
      } catch (e) {
        console.error("Error clearing chat session:", e);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      sender: "User",
      senderName: "You",
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Pass sessionId with the request
      const aiResponse = await sendMessageToBittu(newMessage, sessionId);

      const botMessage = {
        sender: "Bittu",
        senderName: "Bittu",
        message: aiResponse || "No response received",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // Add error message to the chat
      setMessages((prev) => [...prev, {
        sender: "Bittu",
        senderName: "Bittu",
        message: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  return (
    <motion.div
      className="flex flex-col h-[500px] bg-[#f8f9fa] rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Chat Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Chat with Bittu</h3>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 focus:outline-none">
          ✖
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === "User" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${message.sender === "User" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
              <div className="text-sm font-semibold mb-1">{message.senderName}</div>
              <div>{message.message}</div>
              <div className="text-xs mt-1 opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-md p-2 bg-white text-black focus:outline-none focus:ring focus:border-blue-400 transition"
            autoFocus
          />
          <button type="submit" className="bg-[#B22222] text-white px-4 py-2 rounded-md hover:bg-[#8B1A1A] transition">
            Send
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default ChatInterface;