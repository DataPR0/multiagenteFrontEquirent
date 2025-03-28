import React, { useState, useEffect } from 'react';
import '../styles/FilterByUser.css';
import { motion } from 'framer-motion';
import { IoCloseCircleOutline } from "react-icons/io5";
import { useAuth } from './AuthContext';
import SelectFilterUsers from './SelectFilterUsers';
import api from '../hooks/useAxiosInstance';
import { API_URL } from '../utils/api';

interface FilterByUserProps{
    handleShowFilters : () => void;
    handleFilterByUsers: (value: any) => void;
}

const FilterByUser: React.FC<FilterByUserProps> = ({ handleShowFilters, handleFilterByUsers }) => {

    const { user } = useAuth();
    const [userSelected, setUserSelected] = useState<string | undefined>(undefined)
    const [principalSelected, setPrincipalSelected] = useState<string | undefined>(undefined)
    const [supervisorSelected, setSupervisorSelected] = useState<string | undefined>(undefined)
    const [advisorSelected, setAdvisorSelected] = useState<string | undefined>(undefined)

    useEffect(() => {
        const filterB = async () => {
            if(userSelected){
                try{
                    const response = await api.get(`${API_URL}/conversations/?user_id=${userSelected}`) 
                    console.log(response.data)
                    handleFilterByUsers(response.data)
                } catch(error){
                    console.log(error)
                }
            }
        }
        filterB();
        // setSupervisorSelected(undefined);
        // setAdvisors([]);
    }, [userSelected]);

    const handlePrincipalSelected = (value: string) => {
        setPrincipalSelected(value);
    };

    const handleSupervisorSelected = (value: string) => {
        setSupervisorSelected(value);
    };

    const handleAdvisorSelected = (value: string) => {
        setAdvisorSelected(value);
    }

    // const reviewSupervisor = () => {
    //     if (user.role_code === "ADMIN"){
    //         return 2;
    //     } else {
    //         return 1;
    //     }
    // }

    // const reviewAdvisor = () => {
    //     if (user.role_code === "ADMIN"){
    //         return 3;
    //     } else if (user.role_code === "PRINCIPAL") {
    //         return 2;
    //     } else {
    //         return 1;
    //     }
    // }

    const handleFilter = async () => {
        if (advisorSelected){
            setUserSelected(advisorSelected);
        } else if(supervisorSelected){
            setUserSelected(supervisorSelected)
        } else if(principalSelected) {
            setUserSelected(principalSelected);
        } else {
            return
        }
        handleShowFilters()
        
    }

    return (
        <motion.div 
        className="filter-container"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        >
            <button className="btn-close" onClick={handleShowFilters}><IoCloseCircleOutline className="btn-close-icon" /></button>
            <div className="filter-box">
                {(user.role_code === "ADMIN" || user.role_code === "AUDIT") && (
                    <SelectFilterUsers
                        roleId={3}
                        label="Elegir director: "
                        value={principalSelected}
                        onChange={handlePrincipalSelected}
                    />
                )}

                {(user.role_code === "ADMIN" || user.role_code === "PRINCIPAL" || user.role_code === "AUDIT") && (
                    <SelectFilterUsers
                        roleId={2}
                        parentId={Number(principalSelected)}
                        label={"Elegir supervisor:"}
                        value={supervisorSelected}
                        onChange={handleSupervisorSelected}
                    />
                )}
                
                {(user.role_code === "ADMIN" || user.role_code === "PRINCIPAL" || user.role_code === "SUPERVISOR" || user.role_code === "AUDIT") && (
                    <SelectFilterUsers
                        roleId={1}
                        parentId={user.role_code !== "SUPERVISOR" ? supervisorSelected : user.id}
                        label="Elegir asesor:"
                        value={advisorSelected}
                        onChange={handleAdvisorSelected}
                    />
                )}
                <button onClick={handleFilter} className="btn-filter" >Buscar</button>
            </div>
        </motion.div>
    )

}

export default FilterByUser;
