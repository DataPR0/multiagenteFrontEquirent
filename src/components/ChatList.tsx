import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatList.css';
import { IoFileTrayFullOutline } from "react-icons/io5";
import { MdAssignmentAdd } from "react-icons/md";
import { FaFilter } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import StateMenu from "./StateMenu";
import FilterByUser from './FilterByUser';
import { AnimatePresence } from 'framer-motion';
// import profileImg from "../assets/profile.png";
import api from '../hooks/useAxiosInstance';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from './AuthContext';
import { WS_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { UserStatusIcon } from './UserStatusIcon';


interface Chat {
  id: string;
  phoneNumber: string;
  lastMessage: string;
  time: string;
  state_id: number;
  unread_count: number; 
  assigned_user_id: number;
}


interface ChatListProps {
  onSelectChat: (id: string|null, chat: Chat | null) => void;
  chatId: string |null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, chatId }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [filter, setFilter] = useState('all');
  const [user_status, setUserStatus] = useState(localStorage.getItem("user_status") || "available");
  const [error] = useState('');
  const [menu, setMenu] = useState(false);
  const [filterBox, setFilterBox] = useState(false);
  const { permission, requestPermission, showNotification } = useNotifications();
  const [wsLastMessage, setWsLastMessage] = useState<any>(null);
  const [filteredByUser, setFilteredByUser] = useState(false);
  const navigate = useNavigate();

  // Function to update the state
  const handleUpdateUserStatus = (status: string) => {
    setUserStatus(status);
  };

  let selectedChat = useRef<string|null>(null);

  let ws: WebSocket | null = null;

  // Cargar conversaciones desde la API
  useEffect(() => {
    if(!filteredByUser){
      const loadMsgs = async () => {
        try {
          await api.get('/conversations', {withCredentials: true})
          .then((response) => {
            const data = response.data;
            if(Array.isArray(data)){
              setChats(
                data.map((conversation) => ({
                  id: conversation.id,
                  phoneNumber: conversation.client_phone,
                  lastMessage: conversation.last_message || 'Mensaje no disponible',
                  time: conversation.updated_at || conversation.created_at,
                  created_at: conversation.updated_at || conversation.created_at,
                  state_id: conversation.state_id,
                  unread_count: conversation.unread_count,
                  assigned_user_id: conversation.assigned_user_id
                })).sort((chatA, chatB) => {
                  return Date.parse(chatB.time) - Date.parse(chatA.time)}
                )
              );
            } else{
              throw new Error('error')
            }
          })
          .catch((error) => {
            console.log(error)
          });
        } catch(error){
          console.log(error)
        }
      }
      loadMsgs();
    }
    if (!ws){
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      ws = new WebSocket(`${WS_URL}/notifications/ws?user_id=${user.id}`);
      ws.onopen = () => console.log('Conectado');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido:", data);
        if (wsLastMessage != data){
          setWsLastMessage(data);
          handleNotificationEvent(data.type, data.message, data.conversation);
          if (user.role_code == "AGENT")
            handleNotification(data.type, data.message, data.conversation);
        }
      };
      ws.onerror = (error) => console.error('Error:', error);
      ws.onclose = () => console.log('Conexión cerrada');  
    }
  }, [filteredByUser]);

  // Filtrar conversaciones
  const filteredChats = chats.filter(
    (chat) =>
      (chat.phoneNumber ? chat.phoneNumber.toLowerCase(): "").includes(search.toLowerCase()) &&
      (filter === 'all' ||
        (filter === 'unread' && chat.unread_count >= 1) ||
        (filter === 'read' && chat.unread_count === 0))
  ).sort((chatA, chatB) => {
    return Date.parse(chatB.time) - Date.parse(chatA.time)}
  );

  // cambiar estado de conexión
  const handleShowMenu = () => {
    if(filterBox){
      setFilterBox(false);
    }
    setMenu(prevState => !prevState)
  }

  const handleAdminView = () => {
    navigate("/admin")
  }

  const handleShowFilters = () => {
    setFilterBox(prevState => !prevState);
  }

  const formatPhoneNumber = (phoneNumber:string) => {
    if (!phoneNumber) return '';
    
    let cleaned = phoneNumber.replace('whatsapp:+', '');
    if (cleaned.length>13) {
      cleaned = cleaned.substring(0,13);
    }
    const match = cleaned.match(/^(\d+)(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }    
    return phoneNumber; // Devuelve el original si no coincide con el patrón
  };

  const formatDateTime = (datetime:string) => {
    try {
      const date = new Date(Date.parse(datetime));
      return date.toLocaleString()
    } catch (error) {
      console.error("Parse error", error);
    }
    return datetime;
  }

  const PhoneNumberFormater = (phoneNumber:string) => {
    return <h4>{formatPhoneNumber(phoneNumber)}</h4>;
  }

  const handleNotification = (notification_type: string, message:any, conversation:any) => {
    if(permission === "default"){
      requestPermission()
    }
    let number = "";
    let content = ""
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (notification_type == "end_conversation")
      return
    if (notification_type == "new_transfer" && conversation.user_id != user.id)
      return

    if (notification_type == "new_transfer" && conversation.user_id == user.id) {
      number = formatPhoneNumber(conversation.id);
      content = "Te han transferido una conversación.";
    } else if (message) {
      number = formatPhoneNumber(message.phone_number);
      content = message.content;
    } else {
      number = formatPhoneNumber(conversation.client_phone);
      content = conversation.last_message;
    }
    showNotification(number, content);
  }

  const handleChatSelected = (chat: Chat) => {
    onSelectChat(chat.id, chat);
    selectedChat.current = chat.id;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id == chat.assigned_user_id)
      chat.unread_count = 0;
  };

  const handleNotificationEvent = (eventType:string, message:any, conversation:any) => {
    const data = message ? message : conversation;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    switch (eventType){
      case "new_message":
        setChats((prevChats)=> {
          const chatToChange = prevChats.find((chat)=> chat.id == message.conversation_id);

          if (chatToChange) {
            chatToChange.lastMessage = data.content;
            chatToChange.time = new Date(data.created_at).toISOString();
            if (message.user_id == null && selectedChat.current != message.conversation_id)
              chatToChange.unread_count += 1;
          
          return prevChats.map((chat)=>{
            if (chat.id == message.conversation_id){
              return chatToChange;
            }
            return chat
          }).sort((chatA, chatB) => {
            return Date.parse(chatB.time) - Date.parse(chatA.time)})
          }
          return prevChats;
        });
        break;
      case "new_conversation":
        { 
          const new_chat = {
            id: data.id,
            phoneNumber: data.client_phone,
            lastMessage: data.last_message || 'Mensaje no disponible',
            time: data.updated_at || new Date().toLocaleTimeString(),
            state_id: data.state_id,
            unread_count: data.unread_count,
            assigned_user_id: data.user_id
          }
          if (!new_chat.id) break;
          setChats((prevChats:Chat[] | undefined) => {
            if (prevChats != undefined){
              const chatExists = prevChats.some((chat) => chat.id === new_chat.id);
              if (!chatExists)
                return [new_chat, ...prevChats];
              return prevChats;
            }
            return [new_chat];
          });
          break; 
        }
      case "new_transfer":
          if (data.user_id == user.id){
            const transfer_chat = {
              id: data.id,
              phoneNumber: data.client_phone,
              lastMessage: data.last_message || 'Mensaje no disponible',
              time: data.updated_at || new Date().toLocaleTimeString(),
              state_id: data.state_id,
              unread_count: data.unread_count,
              assigned_user_id: data.user_id
            }
            setChats((prevChats:Chat[] | undefined) => {
              if (prevChats != undefined){
                const chatExists = prevChats.some((chat) => chat.id === transfer_chat.id);
                if (!chatExists)
                  return [transfer_chat, ...prevChats];
                return prevChats;
              }
              return [transfer_chat];
            });
          } else if (data.previous_user == user.id){
            setChats((prevChats) => prevChats.filter((chat) => chat.id != data.id));
            if (chatId == data.id)
              onSelectChat(null, null);
          }
        break;
      case "end_conversation":
        setChats((prevChats)=> {
          console.log(data);
          const chatToChange = prevChats.find((chat)=> chat.id == data.conversation_id);

          if (chatToChange && chatId != data.conversation_id) {
            chatToChange.time = data.created_at;
            chatToChange.unread_count = 0;
            chatToChange.state_id = 3;
          
          return prevChats.map((chat)=>{
            if (chat.id == data.conversation_id){
              return chatToChange;
            }
            return chat
          }).sort((chatA, chatB) => {
            return Date.parse(chatB.time) - Date.parse(chatA.time)})
          }
          return prevChats;
        });
        break;
    }
  };

  const handleFilterByUsers = (chatsByUser: any) => {
    setFilteredByUser(true);
    setChats(
      chatsByUser.map((conversation: any) => ({
        id: conversation.id,
        phoneNumber: conversation.client_phone,
        lastMessage: conversation.last_message || 'Mensaje no disponible',
        time: conversation.updated_at || new Date().toLocaleTimeString(),
        state_id: conversation.state_id,
        unread_count: conversation.unread_count,
        assigned_user_id: conversation.assigned_user_id
      }))
    );
    // setChats(chatsByUser)
  };

  const handleFilterAll = () => {
    setFilter('all');
    setFilteredByUser(false);
  }


  return (
    <div className="chat-list">
        <div className="header">
          <div className="flex flex-col items-center gap-2" onClick={handleShowMenu}>
            {/* <img src={profileImg} alt="Profile" className='box-shadow'/> */}
            <UserStatusIcon status={user_status} />
            <p></p>
          </div>
          <div className='flex' style={{padding: "0.3rem", alignContent: "center"}}>
              <h5>{user.full_name}</h5>
          </div>
        {user.role_code !== "AGENT" &&
        <div className="opt-btns-container">
          {user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" ? <button className="opt-btns box-shadow" onClick={handleShowFilters}><FaFilter/></button>: null}
          {user.role_code === "ADMIN" || user.role_code === "PRINCIPAL" || user.role_code === "SUPERVISOR" || user.role_code === "SUPPORT" || user.role_code === "DATA_SECURITY" || user.role_code === "AUDIT" ? <button className="opt-btns box-shadow" onClick={handleAdminView}><MdAssignmentAdd/></button>: null}
        </div>
        }
      </div>
      <div className="search-bar">
        <div className="input-search-bar">
          <i><FaMagnifyingGlass /></i>
          <input
            type="text"
            placeholder="Buscar contactos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='input-search'
          />
        </div>
        <div className="container-filter-btns">
          <button
            className={`filter-button box-shadow ${filter === 'all' ? 'active' : ''}`}
            onClick={handleFilterAll}
          >
            Todos
          </button>
          <button
            className={`filter-button box-shadow ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídos
          </button>
          <button
            className={`filter-button box-shadow ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídos
          </button>
        </div>
        <div className="asign-container">
          {user.role_code !== "AGENT" ? <button className="asign-btn box-shadow"> <IoFileTrayFullOutline className="asign-btn-icon"/>Sin asignar</button> : null}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      <div className='scrollable'>
        {filteredChats.length > 0 ? (
          filteredChats
            .sort((a,b) => {
              if(a.state_id === 3 &&  b.state_id !== 3) return 1;
              if(a.state_id !== 3 && b.state_id === 3) return -1;
              return 0;
            })
          .map((chat) => (
            <div
              key={chat.id}
              className={chat.state_id !== 3 ? "chat-item" : "chat-item "} 
              onClick={()=>handleChatSelected(chat)}>
              <div className="chat-details">
                {PhoneNumberFormater(chat.phoneNumber)}
                <p>{chat.lastMessage.length <= 45 ? chat.lastMessage : chat.lastMessage.substring(0, 45) + '...'}</p>
                <span>{formatDateTime(chat.time)}</span>
              </div>
              <div className="chat-status">
              <span className={`${chat.state_id === 3 ? "close" : ""} ${chat.state_id !== 3 && chat.unread_count >= 1 ? "color-green" : ""}`}>
              {chat.state_id !== 3 && chat.unread_count >= 1 ? chat.unread_count : (chat.state_id === 3 ? "Finalizado" : "")}
              </span>
              </div>
            </div>
          ))) : (
            !error && <p className="no-chats-message">No hay conversaciones disponibles.</p>
        )}
      </div>
      <AnimatePresence mode="wait">
        {menu && (
          <StateMenu handleShowMenu={handleShowMenu} handleUpdateUserStatus={handleUpdateUserStatus}/>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {filterBox && (<FilterByUser handleShowFilters={handleShowFilters} handleFilterByUsers={handleFilterByUsers} />)}
      </AnimatePresence>
      
    </div>
  );
};

export default ChatList;
