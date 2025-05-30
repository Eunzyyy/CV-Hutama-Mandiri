// src/app/customer/chat/page.tsx - FULL FEATURES UPDATE
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageCircle, 
  Send, 
  Plus, 
  User, 
  Clock,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Search,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  File,
  Download,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface Attachment {
  id: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  cloudinaryId?: string;
}

interface Message {
  id: number;
  message?: string;
  createdAt: string;
  isRead: boolean;
  attachments: Attachment[];
  sender: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface Conversation {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  admin?: { id: number; name: string; email: string };
  finance?: { id: number; name: string; email: string };
  customer: { id: number; name: string; email: string };
  messages: Message[];
  _count: { messages: number };
}

export default function CustomerChatPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newChatData, setNewChatData] = useState({
    recipientType: "ADMIN",
    subject: "",
    message: ""
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations();
    }
  }, [status]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (status === "authenticated" && !error) {
      const interval = setInterval(() => {
        if (selectedConversation) {
          fetchMessages();
        }
        fetchConversations();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, status, error]);

  // ✅ SEARCH FUNCTIONALITY
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => 
        conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.admin?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.finance?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages?.[0]?.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/chat/conversations?search=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      
      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("Server returned HTML instead of JSON");
      }
      
      const data = JSON.parse(responseText);
      
      if (data.conversations) {
        setConversations(data.conversations);
      } else if (Array.isArray(data)) {
        setConversations(data);
      } else {
        setConversations([]);
      }
      
      setError(null);
    } catch (error: any) {
      console.error("❌ Error fetching conversations:", error);
      setError(error.message);
      if (!isLoading) {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      
      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("Server returned HTML instead of JSON");
      }
      
      const data = JSON.parse(responseText);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ Error fetching messages:", error);
      toast.error(`Error loading messages: ${error.message}`);
    }
  };

  // ✅ DELETE CONVERSATION
  const deleteConversation = async (conversationId: number) => {
    if (!confirm("Yakin ingin menghapus chat ini?")) return;

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (selectedConversation === conversationId) {
          setSelectedConversation(null);
        }
        toast.success("Chat berhasil dihapus");
      } else {
        throw new Error("Failed to delete conversation");
      }
    } catch (error: any) {
      console.error("❌ Error deleting conversation:", error);
      toast.error("Gagal menghapus chat");
    }
  };

  // ✅ FILE UPLOAD
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (files.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} terlalu besar (max 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    const uploadedAttachments = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          uploadedAttachments.push(data.attachment);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      }

      setSelectedFiles([]);
      return uploadedAttachments;
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error(`Upload gagal: ${error.message}`);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const createNewChat = async () => {
    if (!newChatData.message.trim()) {
      toast.error("Pesan tidak boleh kosong");
      return;
    }

    try {
      setIsSending(true);
      
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newChatData)
      });

      const responseText = await response.text();
      
      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("Server returned HTML instead of JSON");
      }
      
      const data = JSON.parse(responseText);
      
      if (response.ok && data.conversation) {
        // ✅ JIKA EXISTING CONVERSATION, UPDATE LIST
        if (data.isExisting) {
          fetchConversations(); // Refresh untuk dapat latest
          setSelectedConversation(data.conversation.id);
          toast.success("Pesan terkirim ke chat yang sudah ada");
        } else {
          setConversations(prev => [data.conversation, ...prev]);
          setSelectedConversation(data.conversation.id);
          toast.success("Chat baru berhasil dibuat");
        }
        
        setShowNewChatModal(false);
        setNewChatData({ recipientType: "ADMIN", subject: "", message: "" });
        setShowSidebar(false);
      } else {
        throw new Error(data.error || "Failed to create chat");
      }
    } catch (error: any) {
      console.error("❌ Error creating chat:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (!selectedConversation) return;

    const tempMessage = newMessage;
    setNewMessage("");

    try {
      setIsSending(true);

      // Upload files if any
      const attachments = await uploadFiles();

      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          message: tempMessage,
          attachments 
        })
      });

      const responseText = await response.text();
      
      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("Server returned HTML instead of JSON");
      }
      
      const data = JSON.parse(responseText);

      if (response.ok) {
        setMessages(prev => [...prev, data]);
        fetchConversations();
      } else {
        setNewMessage(tempMessage);
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("❌ Error sending message:", error);
      toast.error(`Error: ${error.message}`);
      setNewMessage(tempMessage);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p>Please login to access chat</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchConversations();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex overflow-hidden">
      {/* ✅ SIDEBAR DENGAN SEARCH */}
      <div className={`${showSidebar ? 'w-full md:w-80' : 'hidden md:flex md:w-80'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        {/* SIDEBAR HEADER */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* ✅ SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>{searchQuery ? "Tidak ada hasil" : "Belum ada chat"}</p>
              <p className="text-sm">{searchQuery ? "Coba kata kunci lain" : "Mulai chat baru!"}</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const recipient = conversation.admin || conversation.finance;
              const lastMessage = conversation.messages && conversation.messages.length > 0 
                ? conversation.messages[0] 
                : null;
              const unreadCount = conversation._count?.messages || 0;

              return (
                <div
                  key={conversation.id}
                  className={`group relative p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation === conversation.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedConversation(conversation.id);
                      setShowSidebar(false);
                    }}
                    className="flex items-start space-x-3"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full p-2 flex-shrink-0">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {recipient?.name || "Support Team"}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatDate(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {conversation.subject || "Chat baru"}
                      </p>
                      
                      {/* ✅ PREVIEW MESSAGE DENGAN ATTACHMENT */}
                      {lastMessage && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {lastMessage.attachments && lastMessage.attachments.length > 0 ? (
                            <span className="flex items-center space-x-1">
                              <Paperclip size={12} />
                              <span>{lastMessage.attachments[0].originalName}</span>
                              {lastMessage.message && <span> • {lastMessage.message}</span>}
                            </span>
                          ) : (
                            lastMessage.message
                          )}
                        </div>
                      )}
                      
                      {!lastMessage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Belum ada pesan
                        </p>
                      )}
                      {unreadCount > 0 && (
                        <span className="inline-block bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-2">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ DELETE BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ✅ CHAT AREA DENGAN FILE SUPPORT */}
      <div className={`${!showSidebar || selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-50 dark:bg-gray-900`}>
        {selectedConversation ? (
          <>
            {/* CHAT HEADER */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full p-2">
                <User size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedConversationData?.admin?.name || selectedConversationData?.finance?.name || "Support Team"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedConversationData?.subject || "Chat"}
                </p>
              </div>
            </div>

            {/* MESSAGES AREA DENGAN ATTACHMENT SUPPORT */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ 
                height: 'calc(100vh - 200px)', // Adjusted for file preview
                maxHeight: 'calc(100vh - 200px)'
              }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Belum ada pesan</p>
                    <p className="text-sm">Mulai percakapan!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender.id === parseInt(session?.user?.id || "0");
                  return (
                    <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        isOwn 
                          ? "bg-blue-600 text-white rounded-br-md" 
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                      }`}>
                        {/* ✅ MESSAGE ATTACHMENTS */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="attachment">
                                {attachment.fileType === 'IMAGE' ? (
                                  <div className="relative">
                                    <Image
                                      src={attachment.fileUrl}
                                      alt={attachment.originalName}
                                      width={200}
                                      height={150}
                                      className="rounded-lg object-cover cursor-pointer"
                                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                                    />
                                  </div>
                                ) : (
                                  <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                                    isOwn ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-600'
                                  }`}>
                                    <File size={20} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                                      <p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p>
                                    </div>
                                    <button
                                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                                      className="p-1 rounded hover:bg-black/10"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* MESSAGE TEXT */}
                        {message.message && (
                          <p className="text-sm leading-relaxed">{message.message}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-1 space-x-2">
                          <span className="text-xs opacity-70">
                            {formatDate(message.createdAt)}
                          </span>
                          {isOwn && (
                            <span className="text-xs">
                              {message.isRead ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ✅ FILE PREVIEW SECTION */}
            {selectedFiles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFiles.length} file terpilih:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-600 rounded-lg p-2">
                      <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ MESSAGE INPUT DENGAN FILE UPLOAD */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 p-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex-shrink-0"
                >
                  <Paperclip size={20} />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isSending || isUploading}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={isSending || isUploading || (!newMessage.trim() && selectedFiles.length === 0)}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {isSending || isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={80} className="text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Selamat datang di Chat
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Pilih percakapan untuk memulai chat atau buat chat baru
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                Mulai Chat Baru
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ NEW CHAT MODAL - SAMA SEPERTI SEBELUMNYA */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Chat Baru</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Chat dengan:</label>
                <select
                  value={newChatData.recipientType}
                  onChange={(e) => setNewChatData(prev => ({ ...prev, recipientType: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subjek (opsional):</label>
                <input
                  type="text"
                  value={newChatData.subject}
                  onChange={(e) => setNewChatData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subjek chat..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pesan:</label>
                <textarea
                  value={newChatData.message}
                  onChange={(e) => setNewChatData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tulis pesan Anda..."
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={createNewChat}
                disabled={isSending || !newChatData.message.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSending && <Loader2 size={16} className="animate-spin" />}
                <span>{isSending ? "Mengirim..." : "Kirim"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}