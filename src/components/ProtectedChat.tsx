import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from './AuthContext';

const ProtectedChat = () => {
    const { user } = useAuth();
    if (!user){
        const localUser = localStorage.getItem("user")
        if (!localUser){
            return <Navigate to="/login" />
        }
    }

    return <Outlet />
}

export default ProtectedChat;


