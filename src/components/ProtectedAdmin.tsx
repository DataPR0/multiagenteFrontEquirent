import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from './AuthContext';

const ProtectedAdmin = () => {
    const { user } = useAuth();
    if (!user || (user.role_code != "ADMIN" &&
        user.role_code != "PRINCIPAL" &&
        user.role_code != "SUPERVISOR" &&
        user.role_code != "SUPPORT" &&
        user.role_code != "DATA_SECURITY" &&
        user.role_code != "AUDIT")){
        return <Navigate to="/login" />
    }

    return <Outlet />
}

export default ProtectedAdmin;