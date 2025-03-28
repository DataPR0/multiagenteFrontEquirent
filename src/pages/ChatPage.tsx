// import React from 'react';
// import { useParams } from 'react-router-dom';
// import Message from '../components/Message';
// import MessageInput from '../components/MessageInput';

// interface Chat {
//   id: string;
//   name: string;
//   messages: { text: string; isOwnMessage: boolean }[];
// }

// const dummyChats: Chat[] = [
//   {
//     id: '1',
//     name: 'Juan',
//     messages: [
//       { text: 'Hola, ¿cómo estás?', isOwnMessage: false },
//       { text: 'Bien, gracias. ¿Y tú?', isOwnMessage: true },
//     ],
//   },
//   {
//     id: '2',
//     name: 'Laura',
//     messages: [
//       { text: '¿Listo para mañana?', isOwnMessage: false },
//       { text: 'Sí, nos vemos a las 10.', isOwnMessage: true },
//     ],
//   },
// ];

// const ChatPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const chat = dummyChats.find((chat) => chat.id === id);

//   if (!chat) {
//     return <p>Chat no encontrado</p>;
//   }

//   return (
//     <div className="chat-page">
//       <h1>Chat con {chat.name}</h1>
//       <div className="messages">
//         {chat.messages.map((msg, index) => (
//           <Message key={index} text={msg.text} isOwnMessage={msg.isOwnMessage} />
//         ))}
//       </div>
//       <MessageInput onSend={(message) => console.log(`Enviar mensaje: ${message}`)} />
//     </div>
//   );
// };

// export default ChatPage;
