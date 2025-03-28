import React, { useEffect, useState } from 'react';
import '../styles/StateMenu.css';
import { IoCloseCircleOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import api from '../hooks/useAxiosInstance';
import { API_URL } from '../utils/api';

interface StateOption {
    id: number;
    code: string;
}

interface stateMenuProps {
    handleShowMenu: () => void;
    handleUpdateUserStatus: (status: string) => void;
}
  
  const getStateName = (state: string) => {
    switch (state) {
      case "ONLINE":
        return "En línea";
      case "BREAK":
        return "Break";
      case "OFFLINE":
        return "Desconectado";
      case null:
        return "";
      default:
        return state[0].toUpperCase() + state.slice(1).toLowerCase();
    }
  };

  const getStateCode = (state: string) => {
    switch (state) {
      case "En línea":
        return "available";
      case "Break":
        return "absent";
      case "Desconectado":
        return "disconnected";
      case null:
        return "disconnected";
      default:
        return "absent";
    }
  };

const StateMenu: React.FC<stateMenuProps> = ({ handleShowMenu, handleUpdateUserStatus }) => {

    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [label, setLabel] = useState("En línea");
    const [options, setOptions] = useState(1);
    const [stateList, setStateList] = useState<StateOption[]>([]);

    const handleChangeState = (e: any) => {
        const label = e.target.options[e.target.selectedIndex].innerHTML;
        const value = e.target.value;
        console.log(label);
        console.log(value);
        setLabel(label);
        setOptions(value);
    }

    const handleClose = async () => {
        try {
            await api.put(`${API_URL}/users/${user.id}/state`, 
                {
                    state_id: 3
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        } catch(error){
            console.log(error)
        }
        logout();
        navigate('/login');
    }

    const handleSaveState = async () => {
        try {
            await api.put(`${API_URL}/users/${user.id}/state`, 
                {
                    state_id: options
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            handleShowMenu();
            handleUpdateUserStatus(getStateCode(label));
        }catch(error){
            console.log(error)
        }

    }

    const loadStateMenu = async () => {
        await api.get(`${API_URL}/info/states`)
        .then((response) => {
            const data = response.data;
            if (Array.isArray(data)) {
                setStateList(data);
            }
        })
        .catch((error)=>{
            console.error(error);
        })
    }

    useEffect(() => {
        loadStateMenu();
    }, []);

    return (
        <motion.div className="gray-back"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        >
            <div className="state-menu">
                <button className="btn-close" onClick={handleShowMenu}><IoCloseCircleOutline className="btn-close-icon"/></button>
                {(user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" && user.role_code !== "AUDIT") && (
                    <div>
                        <div className='title-state'>
                            <h3>Cambiar estado</h3>
                        </div>
                        <div className="state-child">
                            <select className="select-state" value={options} onChange={handleChangeState}>
                                {stateList.length > 0 ? (
                                    stateList.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {getStateName(state.code.normalize())}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Disponible">Disponible</option>
                                        <option value="Transición">Transición</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                )}
                <div className="state-child">
                    <div className="btns-actions">
                    {(user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" && user.role_code !== "AUDIT") && <button className="btn-save" onClick={handleSaveState}>Guardar</button>}
                    <button className="btn-save" onClick={handleClose}>Cerrar sesión</button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default StateMenu;
