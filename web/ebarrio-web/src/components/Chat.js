import React, { useContext, useEffect, useState, useRef } from "react";
import { X, Ban, Send, Plus } from "lucide-react";
import { InfoContext } from "../context/InfoContext";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";

//SCREENS
import FAQs from "./FAQs";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { FaQuestionCircle } from "react-icons/fa";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { RiRobot2Fill } from "react-icons/ri";

const Chat = ({ isOpen, setIsOpen }) => {
  const {
    fetchChats,
    chats,
    setChats,
    AIMessages,
    setAIMessages,
    fetchPrompts,
  } = useContext(InfoContext);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [message, setMessage] = useState("");
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [plusClickOutside, setPlusClickOutside] = useState(false);
  const notifRef = useRef(null);
  const aiEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        plusClickOutside
      ) {
        setPlusClickOutside(false);
        setShowButtons(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [plusClickOutside]);

  useEffect(() => {
    setPlusClickOutside(showButtons);
  }, [showButtons]);

  const handleFAQClick = () => {
    setShowButtons(false);
    setShowFAQs(true);
  };

  useEffect(() => {
    if (aiEndRef.current) {
      aiEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [AIMessages]);

  useEffect(() => {
    if (!socket) {
      console.log("🚫 Socket not ready");
      return;
    }

    const handleReceive = async ({ from, to, message, timestamp, roomId }) => {
      console.log("📥 Message received:", { from, to, message, roomId });

      // Ignore own message unless it's a system message
      if (user.userID === from && message !== "This chat has ended.") {
        return;
      }

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => String(chat._id) === String(roomId)
        );

        if (chatIndex !== -1) {
          const chat = prevChats[chatIndex];

          // Check for duplicate by matching message + timestamp
          const isDuplicate = chat.messages.some(
            (m) =>
              m.message === message &&
              m.timestamp === timestamp &&
              m.from === from
          );
          if (isDuplicate) {
            console.log("⚠️ Duplicate message detected — skipping append.");
            return prevChats;
          }

          // Append new message
          const updatedChats = [...prevChats];
          updatedChats[chatIndex] = {
            ...chat,
            messages: [...chat.messages, { from, to, message, timestamp }],
          };
          return updatedChats;
        }

        // Chat not found — trigger new chat fetch
        console.log("🆕 New chat room. Fetching chat:", roomId);
        setActiveChatId(roomId);
        api
          .get(`/getchat/${roomId}`)
          .then(({ data }) => {
            setChats((current) => {
              if (current.some((c) => String(c._id) === String(roomId))) {
                console.log("⚠️ Chat already added after fetch — skipping.");
                return current;
              }
              return [...current, data];
            });
          })
          .catch((err) => {
            console.error("❌ Failed to fetch new chat:", err.message);
          });

        return prevChats; // No immediate state change until fetch completes
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket]);

  useEffect(() => {
    if (!isOpen) return;
    fetchChats();
  }, [isOpen]);

  useEffect(() => {
    if (!isAI) return;
    fetchPrompts();
  }, [isAI]);

  const togglePlus = () => {
    setShowButtons(!showButtons); // Toggle the additional buttons
  };

  const toggleChat = () => {
    setShowButtons(false);
    setIsOpen(!isOpen);
  };

  const handleSelectChat = (chat) => {
    const isUserParticipant = chat.participants.some(
      (p) => p._id === user.userID
    );
    if (!isUserParticipant) return; // 🔒 User is not part of this chat

    const otherParticipant = chat.participants.find(
      (p) => p._id !== user.userID
    );
    const residentId = otherParticipant?.resID?._id;
    if (!residentId) return;

    // ✅ Save resident ID so we can show their full chat history
    setSelectedResidentId(residentId);

    // ✅ Set the active chat ID to the chat with status "active"
    const active = chats.find((c) => {
      const hasUser = c.participants.some((p) => p._id === user.userID);
      const other = c.participants.find((p) => p._id !== user.userID);
      return (
        c.status === "Active" && hasUser && other?.resID?._id === residentId
      );
    });

    if (active) {
      setActiveChatId(active._id);
    } else {
      setActiveChatId(null); // or show warning
    }
  };

  const fullChatHistory = chats
    .filter(
      (c) =>
        c.participants.some((p) => p._id === user.userID) &&
        c.participants.some((p) => p.resID?._id === selectedResidentId)
    )
    .flatMap((c) =>
      c.messages.map((msg) => ({
        ...msg,
        chatId: c._id,
        timestamp: new Date(msg.timestamp),
      }))
    );

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [fullChatHistory]);

  const activeChat = chats.find((chat) => chat._id === activeChatId);

  const handleSend = async () => {
    if (!message.trim() || !activeChat || !socket || loadingSend) return;

    const newMessage = {
      from: user.userID,
      to: activeChat.participants.find((p) => p._id !== user.userID)?._id,
      message,
      timestamp: new Date(),
      roomId: activeChat._id,
    };

    setLoadingSend(true);
    // Emit the message to the server
    socket.emit("send_message", newMessage, (ack) => {
      if (ack.success) {
        setChats((prevChats) => {
          const updatedChats = [...prevChats];
          const chatIndex = updatedChats.findIndex(
            (chat) => chat._id === activeChat._id
          );
          if (chatIndex !== -1) {
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              messages: [...updatedChats[chatIndex].messages, newMessage],
            };
          }
          return updatedChats;
        });
        setMessage("");
        setLoadingSend(false);
      } else {
        confirm(
          "An unexpected error occurred. Please try again later.",
          "errordialog"
        );
      }
    });
  };

  const endChat = async (chatID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to end this conversation?",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const systemMessage = {
        from: user.userID,
        to: activeChat.participants.find((p) => p._id !== user.userID)?._id,
        message: "This chat has ended.",
        timestamp: new Date(),
        roomId: activeChat._id,
      };
      socket.emit("send_message", systemMessage);
      await api.put(`/endchat/${chatID}`);
      setActiveChatId(null);
      confirm("Chat has been successfully ended.", "success");
    } catch (error) {
      console.log("Error ending the chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const last = fullChatHistory.at(-1);
    setIsChatEnded(last?.message === "This chat has ended.");
  }, [fullChatHistory]);

  const handleSendGemini = async () => {
    if (!message.trim() || loadingAI) return;

    setAIMessages((prev) => [
      ...prev,
      { from: "user", message, timestamp: new Date() },
    ]);
    const userMessage = message;
    setMessage("");

    setTimeout(() => {
      setAIMessages((prev) => [
        ...prev,
        { from: "ai", message: "", timestamp: new Date() },
      ]);
    }, 1000);

    setLoadingAI(true);
    try {
      const response = await api.post("/analytics", { prompt: userMessage });

      setTimeout(() => {
        setLoadingAI(false);
        setAIMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.findIndex(
            (msg, i) => msg.from === "ai" && msg.message === ""
          );
          if (lastIndex !== -1) {
            updated[lastIndex] = {
              from: "ai",
              message: response.data,
              timestamp: new Date(),
            };
          }

          return updated;
        });
      }, 1500);
    } catch (error) {
      console.log("Error sending the prompt:", error);
    }
  };
  
  let lastDate = null;

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div ref={notifRef}>
        <button
          onClick={togglePlus}
          className={`chat-plus ${
            showButtons ? "bg-white border border-[#0E94D3]" : "bg-[#0E94D3]"
          }`}
        >
          {showButtons ? (
            <X className="w-7 h-7 text-[#0E94D3] hover:text-white" />
          ) : (
            <Plus className="w-7 h-7 text-wh" />
          )}
        </button>

        {showButtons && (
          <div className="chat-action-btn-container">
            <button onClick={handleFAQClick} className="chat-faq-btn">
              <FaQuestionCircle className="chat-icon" />
            </button>
            <label className="chat-faq-label">FAQs</label>
            <button onClick={toggleChat} className="chat-faq-btn">
              <IoChatbubbleEllipses className="chat-icon" />
            </button>
            <label className="chat-label">Chats</label>
          </div>
        )}
        {showFAQs && <FAQs onClose={setShowFAQs} />}
      </div>

      {isOpen && (
        <div className="modal-container">
          <div className="chat-modal-content">
            {/* Close button */}
            <button onClick={toggleChat} className="chat-close-btn">
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="chat-modal-header flex items-center gap-2">
              {isAI ? (
                <>
                  <RiRobot2Fill className="chat-icon" />
                  <h2 className="text-xl font-semibold">MariBot</h2>
                </>
              ) : (
                <>
                  <IoChatbubbleEllipses className="chat-icon" />
                  <h2 className="text-xl font-semibold">Barangay Chat</h2>
                </>
              )}
            </div>

            {/* Body */}
            <div className="chat-modal-body">
              {isAI ? (
                // Gemini AI full conversation
                <div className="ai-conversation">
                  <div className="msgs-container">
                    {AIMessages.map((msg, i) => {
                      const msgDate = new Date(msg.timestamp).toDateString();
                      const showDateHeader = msgDate !== lastDate;
                      lastDate = msgDate;

                      return (
                        <div key={i}>
                          {showDateHeader && (
                            <div className="text-center text-gray-500 my-2">
                              {msgDate}
                            </div>
                          )}
                          <div
                            className={
                              msg.from === "ai" ? "text-left" : "text-right"
                            }
                          >
                            <div
                              className={`inline-block px-3 py-2 rounded max-w-sm ${
                                msg.from === "ai"
                                  ? "bg-gray-300"
                                  : "bg-[#0E94D3] text-white"
                              } ${msg.message === "" ? "typing" : ""}`}
                            >
                              {msg.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                undefined,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={aiEndRef} />
                  </div>

                  {/* Input Section with Floating Button */}
                  <div className="ai-input">
                    <button
                      onClick={() => setIsAI(!isAI)}
                      className="floating-btn"
                    >
                      <IoChatbubbleEllipses className="w-6 h-6" />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="msgs-input"
                      onKeyDown={(e) => e.key === "Enter" && handleSendGemini()}
                    />
                    <button
                      onClick={handleSendGemini}
                      disabled={loadingAI || !message.trim() || !socket}
                      className="send-btn"
                    >
                      <Send size={20} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Resident chat layout
                <div className="flex w-full">
                  {/* Left Column - Chat List */}
                  <div className="chat-list">
                    {[
                      ...chats
                        .reduce((map, chat) => {
                          const other = chat.participants.find(
                            (p) => p._id !== user.userID
                          );
                          const residentId = other?.resID?._id;
                          if (!residentId) return map;
                          if (
                            !map.has(residentId) ||
                            new Date(chat.updatedAt) >
                              new Date(map.get(residentId).updatedAt)
                          ) {
                            map.set(residentId, chat);
                          }
                          return map;
                        }, new Map())
                        .values(),
                    ].map((conv) => {
                      const otherParticipant = conv.participants.find(
                        (p) => p._id !== user.userID
                      );
                      const lastMsg = conv.messages.at(-1);
                      const picture = otherParticipant?.resID?.picture;

                      return (
                        <div key={conv._id} className="chat-item">
                          <div
                            onClick={() => handleSelectChat(conv)}
                            className={`chat-item-container ${
                              activeChat?._id === conv._id
                                ? "bg-[#0E94D3] text-white"
                                : ""
                            }`}
                          >
                            <img
                              src={picture}
                              alt="Profile"
                             className="chat-item-img border"
                            />
                            <div className="flex-1">
                              <p className="chat-item-name">
                                {otherParticipant?.resID?.firstname}{" "}
                                {otherParticipant?.resID?.lastname}
                              </p>
                              <p className="chat-item-last-msg">
                                {lastMsg?.message || "No messages yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => setIsAI(!isAI)}
                      className="floating-btn"
                    >
                      <RiRobot2Fill className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Right Column - Chat Messages */}
                  <div className="chat-right-container">
                    {selectedResidentId ? (
                      <>
                        <div className="chat-header">
                          {(() => {
                            const anyChat = chats.find((chat) =>
                              chat.participants.some(
                                (p) =>
                                  p.resID?._id === selectedResidentId &&
                                  chat.participants.some(
                                    (pp) => pp._id === user.userID
                                  )
                              )
                            );

                            const resident = anyChat?.participants.find(
                              (p) => p.resID?._id === selectedResidentId
                            );

                            return resident ? (
                              <div className="resident-info">
                                <img
                                  src={resident.resID.picture}
                                  alt={`${resident.resID.lastname}'s profile`}
                                  className="chat-item-img border"
                                />
                                <h2 className="resident-name">
                                  {resident.resID.firstname}{" "}
                                  {resident.resID.lastname}
                                </h2>
                              </div>
                            ) : null;
                          })()}
                        </div>

                        <div className="chat-history">
                          {fullChatHistory.map((msg, i) => {
                            const isDefaultMessage =
                              msg.message ===
                              "This conversation has been forwarded to the barangay office. An admin will get back to you shortly.";
                            if (isDefaultMessage) return null;

                            const timestamp = new Date(msg.timestamp);
                            const currentDateStr = timestamp.toDateString();
                            let prevValidIndex = i - 1;
                            while (
                              prevValidIndex >= 0 &&
                              fullChatHistory[prevValidIndex].message ===
                                "This conversation has been forwarded to the barangay office. An admin will get back to you shortly."
                            ) {
                              prevValidIndex--;
                            }

                            const prevDateStr =
                              prevValidIndex >= 0
                                ? new Date(
                                    fullChatHistory[prevValidIndex].timestamp
                                  ).toDateString()
                                : null;
                            const showDateHeader =
                              currentDateStr !== prevDateStr;

                            const isSystemMessage =
                              msg.message === "This chat has ended.";

                            const chatOfMessage = chats.find((c) =>
                              c.messages.some(
                                (m) =>
                                  m.message === msg.message &&
                                  new Date(m.timestamp).getTime() ===
                                    timestamp.getTime()
                              )
                            );

                            const sender = chatOfMessage?.participants?.find(
                              (p) =>
                                p._id === msg.from || p._id === msg.from?._id
                            );

                            const isOwnMessage =
                              user.userID === msg.from ||
                              user.userID === msg.from?._id;

                            const senderPosition = sender?.empID?.position;
                            const isStaff =
                              senderPosition === "Secretary" ||
                              senderPosition === "Clerk";
                            const alignRight = isStaff || false;
                            const senderLabel = isOwnMessage
                              ? "You"
                              : senderPosition || "Unknown";

                            return (
                              <React.Fragment key={i}>
                                {showDateHeader && (
                                  <div className="date-header">
                                    {timestamp.toDateString()}
                                  </div>
                                )}

                                {isSystemMessage ? (
                                  <div className="system-msg">
                                    {msg.message}
                                  </div>
                                ) : (
                                  <div
                                    className={`mb-2 ${
                                      alignRight ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {isStaff && (
                                      <div className="sender-label">
                                        {senderLabel}
                                      </div>
                                    )}

                                    <div
                                      className={`inline-block px-3 py-2 rounded max-w-sm ${
                                        alignRight
                                          ? "bg-[#0E94D3] text-white"
                                          : "bg-gray-300"
                                      }`}
                                    >
                                      {msg.message}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">
                                      {timestamp.toLocaleTimeString(undefined, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                          <div ref={chatEndRef} />
                        </div>

                        {!isChatEnded && (
                          <div className="message-input-section">
                            <input
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="msgs-input !ml-0"
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSend()
                              }
                            />
                            <button
                              disabled={
                                loadingSend || !socket || !message.trim()
                              }
                              onClick={handleSend}
                              className="send-btn"
                            >
                              <Send size={20} />
                              <span>Send</span>
                            </button>
                            <button
                              onClick={() => endChat(activeChat._id)}
                              className="end-btn"
                            >
                              <Ban size={20} />
                              <span>End</span>
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-chat-selected">
                        Select a conversation
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
