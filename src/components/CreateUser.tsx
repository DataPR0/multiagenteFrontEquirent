import '../styles/CreateUser.css';
import { IoCloseCircleOutline } from "react-icons/io5";
import React, { useState, useEffect } from 'react';
import api from '../hooks/useAxiosInstance';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';

interface Roles {
  id: number;
  code: string;
}

interface User {
  id: number;
  full_name: string;
}

interface CreateUserProps {
  handleShowAddUser: () => void;
  handleNewUser: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ handleShowAddUser, handleNewUser }) => {
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [immediateBoss, setImmediateBoss] = useState('');
  const [isBossDisabled, setIsBossDisabled] = useState(true);
  const [roleSelected, setRoleSelected] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Roles[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await api.get('/info/roles');
        const roleList = user.role_code === "PRINCIPAL" ? response.data.slice(0, 2) : response.data;
        setRoles(roleList);
      } catch (error) {
        console.log(error);
      }
    };
    loadRoles();
  }, [user.role]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setUserName(emailValue.split('@')[0]);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = Number(e.target.value);
    setRoleSelected(selectedRole);

    if (selectedRole) {
      setIsBossDisabled(false);
    } else {
      setIsBossDisabled(true);
    }
    bossData(selectedRole);
  };

  const handleBoss = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImmediateBoss(e.target.value);
  };

  const handleCreateUser = async () => {
    try {
      const response = await api.post('/admin/users', {
        username: userName,
        full_name: fullName,
        email,
        role_id: roleSelected,
        parent_id: immediateBoss ? immediateBoss : null, 
      });
      console.log(response);
      handleNewUser();
      handleShowAddUser();
    } catch (error) {
      console.log(error);
    }
  };

  const bossData = async (selectedRole: number) => {
    try {
      const response = await api.post('/users', {
        role_id: selectedRole !== 3 ?  selectedRole + 1 : ''
      })
      console.log(response.data)
      setUsers(response.data)
    } catch(error){
      console.log(error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="back-admin"
    >
      <div className="create-user-container">
        <button className="btn-close" onClick={handleShowAddUser}>
          <IoCloseCircleOutline className="btn-close-icon" />
        </button>
        <div className="create-user-body">
          <h3>Ingrese los siguientes datos:</h3>
          <div className="form-create-user">
            <h5>Nombre de usuario</h5>
            <input className="inputs-create-user" value={userName} disabled />

            <h5>Nombre completo</h5>
            <input
              className="inputs-create-user"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <h5>Correo</h5>
            <input
              className="inputs-create-user"
              type="email"
              value={email}
              onChange={handleEmailChange}
            />

            <h5>Rol a asignar</h5>
            <select className="select-role" value={roleSelected} onChange={handleRoleChange}>
              <option value={0}>Seleccione un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.code}
                </option>
              ))}
            </select>

            <h5>Jefe inmediato</h5>
            <select
              className="select-role"
              value={immediateBoss}
              onChange={handleBoss}
              disabled={isBossDisabled}
            >
              <option value="">Seleccione un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>

            <button className="add-user-admin submit" onClick={handleCreateUser}>
              Crear
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateUser;
