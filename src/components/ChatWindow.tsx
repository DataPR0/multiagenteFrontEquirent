// ocultar cosas segun rol 
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import '../styles/ChatWindow.css';
import { BsPaperclip } from "react-icons/bs";
import { FaRegFile, FaRegFilePdf, FaRegFileWord, FaRegFileImage, FaXmark, FaEye } from "react-icons/fa6";
import { RiShareForwardFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { IoEllipsisVerticalSharp, IoSearch } from "react-icons/io5";
import { AiTwotoneFileText } from "react-icons/ai";
import profileImg from "../assets/profile.png";
import Typify from "../components/Typify"
import { AnimatePresence } from 'framer-motion';
import { MdOutlinePlaylistAdd } from "react-icons/md";
import FastResponse from './FastResponse';
import api from '../hooks/useAxiosInstance';
import { Collection } from './Collection';
import FilePreview from './FilePreview';
import Transfer from './Transfer';
import { pdf } from '@react-pdf/renderer';
import Download from './Download';
import SearchInConver from './SearchInConver';
import useNotifications from '../hooks/useNotifications';
import {API_URL, WS_URL} from '../utils/api';


interface Chat {
  id: string;
  phoneNumber: string;
  lastMessage: string;
  time: string;
  state_id: number;
  unread_count: number; 
  assigned_user_id: number;
}


interface ChatWindowProps {
  chatId: string | null;
  chat: Chat | null;
}

interface Message {
  content: string;
  sender_type: number;
  timestamp: string;
  created_at: string;
  user_id: number;
  user_name?:string;
  attachment?: string;
  attachment_type?: string;
  attachment_name?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, chat }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error] = useState('');
  const [clikEndChat, setClikEndChat] = useState(false);
  const [endChat, setEndChat] = useState(false);
  const [fastResponse, setFastResponse] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lastActivity, setLastActivity] = useState("");
  const [chatState, setChatState] = useState(0);
  const [collection, setCollection] = useState(false);
  const [lastMesg, setLastMsg] = useState("");
  const [attachments, setAttachments] = useState<FileList|null>(null);
  const [transfer, setTransfer] = useState(false);
  const [conver, setConver] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchConver, setSearchConver] = useState('');
  const { permission, requestPermission, showNotification } = useNotifications();

  const AVAILABLE_FILE_TYPES = [
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png", 
    "image/jpeg", 
    "image/jpg"
  ];

  let chatSocket: null | WebSocket = null;

  // Función para cargar mensajes desde la API
  const fetchMessages = async () => {
    if (chatId) {
      try{
        await api.get(`${API_URL}/conversations/${chatId}`)
        .then(async (response) => {
          const data = response.data;
          console.log(data)
          setConver(data)
          setPhoneNumber(data.detail.client_phone)
          setLastActivity(data.detail.updated_at)
          setMessages(data.messages);
          await setMessages(data.messages);
          setChatState(data.detail.state_id);
          setLastMsg(data.detail.updated_at)
          setChatState(data.detail.state_id);
          setLastMsg(data.detail.updated_at)
          await connectSocket();
          setTimeout(()=> scrollToLastMessage(), 100);

        })
        .catch((error) => {
          console.log("entro al .catch")
          console.log(error)
          
        })
      }catch(error){
          console.log("entro al catch")
          console.log(error)
      }
    }
  };
  

  // Conectar al Websocket del chat
  const connectSocket = async () => {
    if (!chatSocket){
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      chatSocket = await new WebSocket(`${WS_URL}/chats/${chatId}/ws?user_id=${user.id}`);
      chatSocket.onopen = () => {
        console.log('Conectado');
      };
      chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const dataMessage = Array.isArray(data.message) ? data.message : [data.message];
        const sessionUserData = localStorage.getItem('user');
        const user = JSON.parse(sessionUserData || "{}");
        let endChat:boolean = false;
        let newLastActivity:string = lastActivity;
        const newMessages:Message[] = [];
        let messageUser:number = -1;
        if (data.type == "message"){
          dataMessage.forEach((message:Message) => {
            if (message.content == "##EndChat##")
              endChat = true;
            if (user.id != message.user_id)
              newMessages.push(message);
            if (message.timestamp)
              newLastActivity = message.timestamp;
            messageUser = message.user_id;
          });
          setLastActivity(newLastActivity);

          if (endChat) {
            setChatState(3);
          } else if (user.id != messageUser){
            setMessages((prevMessages) => prevMessages.concat(newMessages));
            if (newMessages.length > 0 && !messageUser && user.role_code == "AGENT"){
              handleNotification(phoneNumber, newMessages.reverse()[0].content);
            }
          }
          setTimeout(()=>scrollToLastMessage(), 100);
        }
        
      };
      chatSocket.onerror = (error) => console.error('Error:', error);
      chatSocket.onclose = () => console.log('Conexión cerrada');
    }
  };

  const scrollToLastMessage = () => {
    let messagesDivs = document.getElementById("messages-list")?.getElementsByClassName("message");
    if (!messagesDivs) return;
    messagesDivs[messagesDivs.length - 1].scrollIntoView();
  }

  // Efecto para cargar mensajes al seleccionar un chat y actualizar periódicamente
  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, []);

  // Enviar un mensaje
  const sendMessage = () => {
    if (chatId && (input.trim() || attachments)) {
      setSending(true);
      const formData = new FormData();
      // Adjuntar archivos
      if (attachments)
        Array.from(attachments).forEach((file)=>{
          formData.append('files', file);
        })

      // Adjuntar carga de Mensaje
      formData.append('to', chatId);
      formData.append('message', input);
      api.post(`${API_URL}/conversations/${chatId}`, 
        formData)
      .then((response) => {
        if (response.status === 200) {
          const sessionUserData = localStorage.getItem('user');
          const user = JSON.parse(sessionUserData || "{}");
          const newMessages: Message[] = [];
          Array.from(response.data.data).forEach((msgData:any) => {
            const msg = msgData.message || {};
            const media = msgData.media || {};
            const newMessage:Message = {
              content: msg.content,
              sender_type: 2,
              user_id: user?.id, 
              timestamp: msg.created_at, 
              created_at: msg.created_at, 
              user_name:user?.full_name,
              attachment: media.url,
              attachment_type: media.mime_type,
              attachment_name: media.filename,
            }
            newMessages.push(newMessage);
          });
          chatSocket?.send(JSON.stringify([{type: "message", "message": newMessages}]));
          const newMsgNumber = newMessages.length;
          if (newMsgNumber > 0){
            setMessages((prevMessages) => prevMessages.concat(newMessages));
            setLastActivity(newMessages[newMsgNumber-1].created_at);
          }

          setInput('');
          setAttachments(null);
          setTimeout(()=>{
            scrollToLastMessage()
          }, 200);
        } else {
          console.error(response.statusText);
        }
      })
      .catch((error) => {
        console.error(error)
      }).finally(() => {
        setSending(false);
        setTimeout(()=>{
          messageTextAreaRef.current?.focus();
        }, 200);
      })
    }
  };

  // Finalizar conversacion o cerrar

  const handleClicEnd = () => {
    setClikEndChat(!clikEndChat)
  }

  const handleEndChat = () => {
    if (chatState != 3)
      setEndChat(!endChat);
    else
      alert("Conversación finalizada");
  }

  // Respuesta rapida

  const handleFastResponse = () => {
    setFastResponse(!fastResponse)

    if(!fastResponse)setCollection(false)
  }
  
  // Resume de chat
  
  const handlecollection = () => {
    setCollection(!collection)

    if(!collection)setFastResponse(false)
  }

  const handleNotification = (phoneNumber: string, content: string) => {
    if(permission === "default"){
      requestPermission()
    }
    showNotification(phoneNumber, content);
  }

  const handleSetAttachments = () => {
    if (fileInputRef)
      fileInputRef.current?.click();
  }

  const handleFileChange = (event:ChangeEvent<HTMLInputElement>) => {
    const input_files = event.target.files; 
    if (input_files)
      setAttachments((prevFiles)=> {
        const dataTransfer = new DataTransfer();
        [prevFiles, input_files].forEach((fileList) => {
          if (fileList)
            Array.from(fileList).forEach((file) => {
              dataTransfer.items.add(file);
            });
        });
        return dataTransfer.files;
      });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
  
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
  
    return `${size} ${sizes[i]}`;
  }

  const getIconByType = (type:string) => {
    switch(type){
      case AVAILABLE_FILE_TYPES[0]:
        return <FaRegFilePdf className='pdf-file'></FaRegFilePdf>
      case AVAILABLE_FILE_TYPES[1]:
      case AVAILABLE_FILE_TYPES[2]:
        return <FaRegFileWord className='word-file'></FaRegFileWord>
      case AVAILABLE_FILE_TYPES[3]:
      case AVAILABLE_FILE_TYPES[4]:
      case AVAILABLE_FILE_TYPES[5]:
        return <FaRegFileImage className='image-file'></FaRegFileImage>
      default:
        return <FaRegFile></FaRegFile>
    }
  }

  const deleteFileByIndex = (index:number)=> {
    setAttachments((prevFiles)=> {
      const dataTransfer = new DataTransfer();
      if (prevFiles)
        Array.from(prevFiles).forEach((file, i) => {
          if (i != index)
            dataTransfer.items.add(file);
      });
      return dataTransfer.files;
    });
  }

  const downloadFile = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index:number) => {
    _event.preventDefault();
    const fileName = messages[index]?.attachment_name || "archivo";
    if (messages[index].attachment?.startsWith('http')){
      const a = document.createElement("a");
      const url = messages[index].attachment;
      const fileName = messages[index].attachment;
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      a.click();
      return;
    }
    const base64Content = messages[index]?.attachment || "";
    const mimeType = messages[index]?.attachment_type || "blob";
    const byteCharacters = atob(base64Content); // Decode Base64
    const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }

  const configureTime = () => {
    const n_date = new Date(lastMesg);
    const format = n_date.toLocaleString('es-MX')
    return format;
    
  }

  const handleShowTransfer = () => {
    setTransfer(!transfer)
  }

  const handleDownload = () => {
    console.log(conver)
    pdf(<Download chat={conver}/>)
      .toBlob()
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "prueba.pdf";
        link.click();
        URL.revokeObjectURL(url);
      })
  }
 

  // filtrar msg
  const filteredMessages = searchConver ? messages.filter((message: Message) =>
      message.content.toLowerCase().includes(searchConver.toLowerCase())  
    ) : messages;

  const highlightText = (text: string) => {
    if (!searchConver) return text; 

    const regex = new RegExp(`(${searchConver})`, 'gi');  
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchConver.toLowerCase() ? (
        <span key={index} className="highlight">{part}</span>  
      ) : (
        part
      )
    );
  };



  const handleSearch = () => {
    setShowSearch(!showSearch)
    setSearchConver('')
  }

  const formatTimestamp = (isoString:string) => {
    if (!isoString)
      return '';
    const date = new Date(isoString);
    const today = new Date();
    
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  
    const options:Intl.DateTimeFormatOptions = isToday
      ? {
          year: undefined,
          month: undefined,
          day: undefined,
          hour: '2-digit',
          minute: '2-digit',
          second: undefined,
          hour12: true,
        }
      : {
          year: 'numeric',
          month: 'numeric', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: undefined,
          hour12: true, 
        };
    
    return new Intl.DateTimeFormat('es-MX', options).format(date);
  }
  
  
  const isSendButtonVisible = () => {
    const user = JSON.parse(localStorage.getItem('user') || "{}");
    console.log("Send button");
    console.log(user);
    return user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" && user.role_code !== "AUDIT";
  };

  const getTransferButton = () => {
    const user = JSON.parse(localStorage.getItem('user') || "{}")
    if (user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" && user.role_code !== "AUDIT" && user.role_code !== "AGENT") {
      return <span>
        <RiShareForwardFill onClick={handleShowTransfer}/>
      </span>;
    }
    return null;
  };

  const getDownloadButton = () => {
    const user = JSON.parse(localStorage.getItem('user') || "{}")
    if (user.role_code !== "SUPPORT" && user.role_code !== "AGENT") {
      return <span>
      <IoMdDownload onClick={handleDownload}/>
    </span>;
    }
    return null;
  };

  const getEndButton = () => {
    const user = JSON.parse(localStorage.getItem('user') || "{}")
    if (user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" && user.role_code !== "AUDIT") {
      return <span >
        <IoEllipsisVerticalSharp onClick={handleClicEnd}/>
      </span>;
    }
    return null;
  };

  return (
    <div className="chat-window">
    <motion.div
      className="chat-window"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      {chatId ? (
        <>
          <div className="chat-header">
          <img
            src={profileImg}
            alt="Profile"
          />
            <div className='text'>
              <h2 className='text-conv'>Conversación con {phoneNumber.replace("whatsapp:","")}</h2>
              <p>Última actividad: {lastActivity ? formatTimestamp(lastActivity) : 'N/A'}</p>
            </div>
              <span className='search' >
                <IoSearch onClick={handleSearch} className='search-input'/>
                {showSearch && <SearchInConver setSearchConver={setSearchConver}/>}
              </span>
              <div className='actions'>
              {getTransferButton()}
              {/* <span>
                <RiShareForwardFill onClick={handleShowTransfer}/>
              </span> */}
              {getDownloadButton()}
              {/* <span>
                <IoMdDownload onClick={handleDownload}/>
              </span> */}
              {getEndButton()}
              {/* <span >
                <IoEllipsisVerticalSharp onClick={handleClicEnd}/>
              </span>   */}
              {clikEndChat && (
                <div className='popUpDots slideInDown'>
                  <div>
                    <span onClick={handleEndChat} className='end-conv'>Finalizar conversación</span>
                  </div>  
                  <div className='not-visible'>
                    <span>Cerrar</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='messages-box'>
            <div id="messages-list" className="messages">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    id={`message-${index}`}
                    key={index}
                    className={`message ${[1, 2].includes(msg.sender_type) ? 'own' : ''}`}
                  >
                      {msg.attachment ? (
                      <div>
                      <FilePreview 
                        fileName={msg.attachment_name && msg.attachment_name.length > 30 ? "Adjunto" : msg.attachment_name} 
                        fileType={msg.attachment_type}
                        fileUrl={msg.attachment}
                        onDownload={downloadFile}
                        index={index}
                      />
                    </div>
                    ): (
                      <></>
                    )}
                  <div>{msg.content}</div>
                    <div className='subtitle'>
                      <span>{formatTimestamp(msg.timestamp ? msg.timestamp : (
                        msg.created_at ? msg.created_at : "")
                      )}</span>
                      <span className='owner'>{msg.user_name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay mensajes en esta conversación.</p>
              )}
            </div>
            <div className={"messages filtered " + (showSearch ? '' : 'not-visible')} >
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg, index) => (
                  <div key={index} className={`message ${[1, 2].includes(msg.sender_type) ? 'own' : ''}`}>
                    <div>{highlightText(msg.content)}</div> 
                    {msg.attachment && <div><a href={msg.attachment}>adjunto</a></div>}
                    <div className="subtitle">
                      <span>{formatTimestamp(msg.timestamp ? msg.timestamp : (
                        msg.created_at ? msg.created_at : "")
                      )}</span>
                      <span className='owner'>{msg.user_name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No se encontraron mensajes</p>
              )}
            </div>
          </div>
          <div className='file-section'>
            <input ref={fileInputRef} className='not-visible' type="file" onChange={handleFileChange} multiple
            accept={AVAILABLE_FILE_TYPES.join(',')} />
            {attachments && (
              <>
              <span className="title"> {attachments.length} Archivos Adjuntos</span>
              <div className='file-container scrollable'>
                {Array.from(attachments).map((file: File, index: number) => (
                  <div className='file-row' key={index}>  
                    <div className='file-icon'>{getIconByType(file.type)}</div>
                    <div className='file-text'>
                      <span className='file-name'>{file.name}</span>
                      <span className='file-size'>{formatFileSize(file.size)}</span>
                    </div>
                    <div className='file-actions'>
                      <FaEye key={'pre_'+index} className='file-preview-btn not-visible'></FaEye>
                      <FaXmark key={'rem_'+index} className='file-remove-btn not-visible' onClick={()=>deleteFileByIndex(index)}></FaXmark>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
          <div className="message-input">
          {chatState !== 3 && isSendButtonVisible() ? (
            <div className="input-bar">
              <textarea
                value={input}
                ref={messageTextAreaRef}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Evita el salto de línea
                    sendMessage();
                  }
                }}
                placeholder="Escribe un mensaje"
                rows={1}
                onInput={(e) => {
                  const textarea = e.target;
                  if (textarea instanceof HTMLTextAreaElement) {
                    setInput(textarea.value);
                    textarea.style.height = 'auto'; // Resetea la altura
                    textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta la altura al contenido
                  }
                }}
              />
              <div className="icon-container">
                <i>
                  <MdOutlinePlaylistAdd
                    className="fast-response"
                    onClick={handleFastResponse}
                  />
                </i>
                <i>
                  <BsPaperclip
                    className="attachment not-visible"
                    onClick={handleSetAttachments}
                  />
                </i>
                <i>
                  <AiTwotoneFileText
                    className="collection not-visible"
                    onClick={handlecollection}
                  />
                </i>
              </div>
            </div>
          ) : (
            chatState === 3 ? 'Chat finalizado: ' + configureTime() : "Envío de mensajes deshabilitado"
          )}
          {chatState !== 3 && isSendButtonVisible() ? <button onClick={sendMessage}>Enviar</button> : null}
        </div>
          {error && <p className="error-message">{error}</p>}
        </>
      ) : (
        <p>Selecciona un chat para comenzar</p>
      )}
    </motion.div>
    <AnimatePresence mode="wait">
      {endChat && <Typify handleEndChat={handleEndChat} chatId={chatId} />}
      {fastResponse && <FastResponse setFastResponse={setFastResponse} setInput={setInput}/>}
      {collection && <Collection setCollection={setCollection}/>}
      {transfer && <Transfer handleShowTransfer={handleShowTransfer} chat={chat}/>}
    </AnimatePresence>
    </div>
  );
};

export default ChatWindow;
