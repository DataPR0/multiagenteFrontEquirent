import { IoMdReturnLeft } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import '../styles/AdminView.css';
import AdminTable from "./AdminTable";
import { useState } from "react";
import { AnimatePresence } from 'framer-motion';
import AdminNotes from "./AdminNotes";
import AdminHierarchy from "./AdminHierarchy";
import equirentLogo from '../assets/equirent.png';
import AdminLogs from "./AdminLogs";

const AdminView = () => {
    const navigate = useNavigate();
    const [showUser, setShowUser] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showHierarchy, setShowHierarchy] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    const handleReturn = () => {
        navigate("/chat");
    }

    const handleShowUserTable = () => {
        setShowNotes(false);
        setShowHierarchy(false);
        setShowLogs(false);
        setShowUser(!showUser);
    }

    const handleShowNotes = () => {
        setShowUser(false);
        setShowHierarchy(false);
        setShowLogs(false);
        setShowNotes(!showNotes);
    }

    const handleShowHierarchy = () => {
        setShowNotes(false);
        setShowUser(false);
        setShowLogs(false);
        setShowHierarchy(!showHierarchy);
    }

    const handleShowLogs = () => {
        setShowNotes(false);
        setShowUser(false);
        setShowHierarchy(false);
        setShowLogs(!showLogs)
    }

    const user = JSON.parse(localStorage.getItem('user') || "{}");

    return (
        <div className="container-admin">
            <div className="admin-header">
                <div className="container-img-header">
                    <img
                        src={equirentLogo}
                        alt="Equirent"
                        className="img-header"
                    />
                </div>
                <div className="admin-btns-header">
                    <button className="header-btns" onClick={handleReturn}><IoMdReturnLeft /></button>
                    {(user.role_code !== "AUDIT" && user.role_code !== "SUPERVISOR") && <button className="header-btns" onClick={handleShowUserTable}>Usuarios</button>}
                    {(user.role_code !== "SUPPORT" && user.role_code !== "DATA_SECURITY" && user.role_code !== "SUPERVISOR") && <button className="header-btns" onClick={handleShowNotes}>Plantillas</button>}
                    {(user.role_code !== "AUDIT" && user.role_code !== "SUPERVISOR") && <button className="header-btns" onClick={handleShowHierarchy}>Jerarquía</button>}
                    <button className="header-btns" onClick={handleShowLogs}>Logs</button>
                </div>
            </div>
            <div className="admin-body">
                <AnimatePresence>
                    {showUser && <AdminTable />}
                    {showNotes && <AdminNotes  />}
                    {showHierarchy && <AdminHierarchy />}
                    {showLogs && <AdminLogs />}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AdminView;
