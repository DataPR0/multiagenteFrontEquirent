import React, { useEffect, useState } from "react";
import api from '../hooks/useAxiosInstance';
import { API_URL } from "../utils/api";
import '../styles/SelectFilterUser.css';

interface User {
    id: number;
    full_name: string;

}

interface SelectFilterUserProps {
    roleId: number;
    parentId?: number;
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
}

const SelectFilterUsers: React.FC<SelectFilterUserProps> = ({ roleId, parentId, label, value, onChange }) => {
    
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const loadUsers = async () => {
            try{
                const response = await api.post(`${API_URL}/users`, {
                    role_id: roleId,
                    user_id: parentId
                }, {
                    headers: { 'Content-Type': 'application/json '}
                })
                if(response.status === 200){
                    setUsers(response.data);
                } else {
                    console.log(response.statusText);
                }
            } catch(error){
                console.log(error)
            }
        };
        if (roleId) loadUsers();
    }, [roleId, parentId])


    return (
        <div className="container-filter-user" >
            <h3>{label}</h3>
            <select className="filters" value={value} onChange={(e) => onChange(e.target.value)}>
                <option className="select-user">Seleccione un usuario</option>
                {users.map((user: User) => {
                    return (
                    <option key={user.id} value={user.id} className="user-id">
                        {user.full_name}
                    </option>
                    )
                })}
            </select>
        </div>
    )
}

export default SelectFilterUsers;