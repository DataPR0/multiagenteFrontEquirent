import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/api";

    interface CredentialsType {
        bodyData: FormData;
    }

  interface ContextType {
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    user: any | null;
  }

const Context = createContext<ContextType | undefined>(undefined);

export const useAuth = (): ContextType =>{
    const context = useContext(Context);
    if (!context){
        throw new Error("Error")
    }
    return context;
} 

const AuthContext = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState(JSON.stringify(localStorage.getItem('user')) || null);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user') || "{}"))
    }, [])

    const login = async (credentials: CredentialsType) => {
        try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        console.log(response)
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch(error){
            throw new Error(String(error))
        }
    } 

    const logout = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/logout`);
            console.log(response);
            if (response.data) {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch(error) {
            throw new Error(String(error));
        }
    }

    return (
        <Context.Provider value={{ login, logout, user }}>
            {children}
        </Context.Provider>
    )
    
};

export default AuthContext;
