import axios from "axios";

const api = axios.create({
  baseURL: "https://desihatti-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendMessageToBittu = async (message, sessionId = 'default') => {
  try {
    const response = await fetch(`https://desihatti-production.up.railway.app/api/chat?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error sending message to Bittu:', error);
    throw error;
  }
};

export default api;