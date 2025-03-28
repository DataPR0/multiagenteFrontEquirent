import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { AnimatePresence } from 'framer-motion';
import '../App.css';

interface Chat {
  id: string;
  phoneNumber: string;
  lastMessage: string;
  time: string;
  state_id: number;
  unread_count: number; 
  assigned_user_id: number;
}


const Chat = () => {
    const [selectedChatId, setSelectedChatId] = useState<string | null>("");
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    const handleSelectedChat = (id: string | null, chat: Chat | null) => {
      setSelectedChatId(id);
      setSelectedChat(chat);
    }

    return (
        <div className='app-container'>
            <ChatList onSelectChat={handleSelectedChat} chatId={selectedChatId}  />
                <div className="chat-window-container">
                  <AnimatePresence mode="wait">
                    {selectedChatId && (
                        <ChatWindow key={selectedChatId} chatId={selectedChatId} chat={selectedChat} />
                    )}
                  </AnimatePresence>
                </div>
        </div>
    )

}

export default Chat;


