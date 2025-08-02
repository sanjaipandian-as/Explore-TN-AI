import React, { useState } from "react";
import axios from "axios";
import.meta.env.VITE_GEMINI_API_KEY;
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

function ChatApp() {
  const geminifetch = async (prompt) => {
    try {
      const systemPrompt = `You are a highly specialized AI travel planner for Tamil Nadu tourism. 
You must only respond with Tamil Nadu-related travel plans, itineraries, attractions, food spots, cultural sites, and travel tips. 

If the user asks anything unrelated to Tamil Nadu tourism, politely decline to answer and remind them that you only provide Tamil Nadu travel guidance.

Your response should include:

- Day-wise itinerary (Morning, Afternoon, Evening)
- Duration at each location & Travel time
- Entry fees (if applicable)
- Nearby food recommendations
- Weather-based tips
- Alternative options for closures or crowded places
- Unique local experiences
- Estimated budget (transport, tickets, and food)
- Best Instagram-worthy photo spots
- Emergency contacts for safety

⚠️ STRICT RULE: If a user asks about a different state/country, reply:  
*"I specialize in Tamil Nadu tourism. Please ask about Tamil Nadu destinations."*

If the user requests responses in 'Tanglish' (Tamil + English), reply in an engaging, fun way using mixed language.

Now, please provide an accurate and well-structured travel response based on the user’s query.`;

      const requestBody = {
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: prompt }] },
        ],
      };

      const resp = await axios.post(GEMINI_API_URL, requestBody);
      let responseText =
        resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No relevant tourism data found.";
      responseText = responseText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*/g, "•")
        .replace(/\n/g, "<br>");
      return responseText;
    } catch (e) {
      console.error("Error fetching response:", e.message);
      return "Error connecting to the AI server. Please try again.";
    }
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    const botTextResponse = await geminifetch(input);

    setMessages((prev) => [...prev, { text: botTextResponse, sender: "bot" }]);
    setLoading(false);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#18122B] to-[#1E1A36] flex justify-center items-center p-4">
      <div className="w-full max-w-3xl h-full max-h-[90vh] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <header className="p-4 border-b border-white/10 bg-white/10 backdrop-blur-md text-white font-semibold text-xl">
          Explore Tamil Nadu - AI Travel Planner
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent shadow-inner">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-white">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-2xl rounded-br-none"
                    : "bg-white/10 text-gray-200 rounded-2xl rounded-bl-none"
                }`}
              >
                <div
                  className="text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                ></div>
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center ml-2 text-xs font-bold text-white">
                  U
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-t-4 border-purple-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/10 backdrop-blur-md flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Tamil Nadu Tourism..."
            className="flex-1 px-4 py-3 rounded-l-full bg-[#2D2A4A] text-white placeholder-gray-400 focus:outline-none text-base"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-medium rounded-r-full transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
