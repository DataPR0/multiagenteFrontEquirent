import { motion } from 'framer-motion';
import '../styles/AdminNotes.css';
import { useState, useEffect } from "react";
import api from '../hooks/useAxiosInstance';
import { MdModeEditOutline, MdDelete, MdOutlineCancel } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";

interface Note {
    id: string;
    content: string;
  }

const AdminNotes = () => {

    const [adminNotes, setAdminNotes] = useState<Note[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [addNote, setAddNote] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState("");

    useEffect(() => {
        const getNotes = async () => {
            try {
                const response = await api.get('/templates')
                if (response.status === 200){
                    setAdminNotes(response.data.default_templates)
                }
            } catch(error){
                console.log(error);
            }
        }
        getNotes();
    }, []);

    const handleSaveNote = async (e:any) => {
        e.preventDefault();
        if (addNote.trim() !== ""){
            try {
                const response = await api.post('/templates', {
                    content: addNote
                })
                setAdminNotes([response.data, ...adminNotes])
            } catch(error){
                console.log(error)
            }
            setAddNote('');
        }
    }

    const handleNewNote = (e:any) => {
        const note = e.target.value;
        setAddNote(note);
    }

    const handleDeleteNote =async  (e: any, id: string) => {
        e.preventDefault();
        try {
            const response = await api.delete(`/templates/${id}`);
            if (response.status === 204){
                setAdminNotes(prevSendNote => prevSendNote.filter(nota => nota.id !== id));
            }
        } catch(error){
            console.log(error);
        }
    }

    const handleEditMode = (e: any, noteId: string, currentContent: string) => {
        e.preventDefault();
        setEditMode(true);
        setEditingNoteId(noteId);
        setEditedContent(currentContent);
    }

    const handleCancel = (e: any) => {
        e.preventDefault();
        setEditMode(false);
        setEditingNoteId(null);
        setEditedContent("");
    }

    const handleSaveEdit = async (e: any, noteId: string) => {
        e.preventDefault();
        if (editedContent.trim() !== ""){
            try{
                const response = await api.put(`/templates/${noteId}`, {
                    content: editedContent
                });
                if (response.status === 200){
                    setAdminNotes(prev =>
                        prev.map(nota => 
                            nota.id === editingNoteId ? { ...nota, content: editedContent } : nota
                        )
                    );
                    setEditMode(false);
                    setEditingNoteId(null);
                    setEditedContent('');
                }
            } catch(error){
                console.log(error);
            }
        }
    }

    const user = JSON.parse(localStorage.getItem('user') || "{}");

    return (
        <motion.div className='admin-notes'
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.3 }}
        >
            <div className='admin-notes-container'>
                <h3>Plantillas Disponibles</h3>
                <div className="admin-notes-list">
                    {adminNotes.map((nota, index) => (
                        <div key={index} className='admin-note-container'>
                            <div className='admin-note-item'>
                                {editMode && editingNoteId === nota.id ? (
                                    <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}              
                                    />
                                ): (nota.content)}
                            </div>
                            {!editMode && (user.role_code !== "AUDIT" && user.role_code !== "PRINCIPAL") && <button onClick={(e) => handleEditMode(e, nota.id, nota.content)} className="btns-opt-notes"><MdModeEditOutline className="edit-note-icon"/> </button>}
                            {!editMode && (user.role_code !== "AUDIT" && user.role_code !== "PRINCIPAL") && <button onClick={(e) => handleDeleteNote(e, nota.id)} className="btns-opt-notes"><MdDelete className="delete-note-icon" /></button>}   
                            {editMode && (user.role_code !== "AUDIT" && user.role_code !== "PRINCIPAL") && editingNoteId === nota.id && <button onClick={(e) => handleSaveEdit(e, nota.id)} className="btns-opt-notes"><FaRegSave className="save-note-icon" /></button>}
                            {editMode && (user.role_code !== "AUDIT" && user.role_code !== "PRINCIPAL") && editingNoteId === nota.id && <button onClick={(e) => handleCancel(e)} className="btns-opt-notes"><MdOutlineCancel className="cancel-note-icon"/></button>}
                        </div>
                    ))}
                </div>
                {(user.role_code !== "AUDIT" && user.role_code !== "PRINCIPAL") &&
                <div className='form-container-admin'>
                    <form className='form-admin-note' onSubmit={handleSaveNote}>
                        <textarea 
                            placeholder='Ingrese una nueva plantilla'
                            value={addNote}
                            onChange={handleNewNote}
                            className="large-texTarea"
                        />
                        <button className='btn-admin-note' type='submit'>Guardar</button>
                    </form>
                </div>}
            </div>
        </motion.div>
    )
}

export default AdminNotes