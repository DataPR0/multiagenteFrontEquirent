import { motion } from 'framer-motion';
import { IoCloseCircleOutline } from "react-icons/io5";
import '../styles/Transfer.css';
import React, { useEffect, useState } from 'react';
import api from '../hooks/useAxiosInstance';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/api';

interface Chat {
    id: string;
    phoneNumber: string;
    lastMessage: string;
    time: string;
    state_id: number;
    unread_count: number; 
    assigned_user_id: number;
  }

interface User {
    id: number;
    full_name: string;

}

interface TransferProps {
    handleShowTransfer: () => void;
    chat: Chat | null;
}

const Transfer: React.FC<TransferProps> = ({ handleShowTransfer, chat }) => {

    const { user } = useAuth();
    const [usersTranfer, setUserTransfer] = useState([])
    const [assignedUser, setAssignedUser] = useState<string>()
    const [userSelected, setUserSelected] = useState()

    useEffect(() => {
        const loadPossibleUsers = async () => {
            try{
                const response = await api.post(`${API_URL}/users`, {
                    role_id: 1,
                    user_id: user.role_code === "SUPERVISOR" ? user.id : null
                }, {
                    headers: { 'Content-Type': 'application/json '}
                })
                if(response.status === 200 && chat !== null){
                    const withOutAssigned = response.data.filter((item: { id: number; }) => item.id !== chat.assigned_user_id)
                    const assigned = response.data.filter((item: { id: number; }) => item.id === chat.assigned_user_id)
                    // console.log(assigned[0].full_name) // url chatid body user_id al q se transfiere 
                    if (assigned.length > 0){
                        setAssignedUser(assigned[0].full_name)
                    } else {
                        setAssignedUser("Sin Asignar");
                    }
                    setUserTransfer(withOutAssigned);
                } else {
                    console.log(response.statusText);
                }
            } catch(error){
                console.log(error)
            }
        }
        loadPossibleUsers();
    }, []);

    const handleTransfer = async () => {
        if (chat !== null){
            await api.post(`${API_URL}/conversations/${chat.id}/transfer`, {
                user_id: userSelected
            }, {
                headers: { 'Content-Type': 'application/json '}  
            }).then((response)=> {
                if (response.status === 200 && response.data.success){
                    handleShowTransfer();
                }
            })
        }

    }

    const handleSelectUser = (e: any) => {
        console.log(e.target.value)
        setUserSelected(e.target.value)
    }

    return (
        <motion.div className="gray-back"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
        >
            <div className="transfer-container">
                <button className="btn-close" onClick={handleShowTransfer}><IoCloseCircleOutline className="btn-close-icon"/></button>
                <div className="transfer-body">    
                    <h4>Seleccione el usuario al cual transferir la conversación</h4>
                    {assignedUser ? <h5 className='tittle-user-asig'>Actualmente esta asignado a: {assignedUser}</h5> : null}
                    <select className="users-to-change" value={userSelected} onChange={handleSelectUser}>
                        <option>Seleccione un usuario</option>
                        {usersTranfer.map((us: User) => {
                            return (
                                <option key={us.id} value={us.id}>
                                    {us.full_name}
                                </option>
                            )
                        })}
                    </select>
                    <button className="btn-transfer" onClick={handleTransfer}>Transferencia</button>
                </div>
            </div>
        </motion.div>
    )   
}

export default Transfer;
