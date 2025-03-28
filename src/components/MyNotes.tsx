import React, { useState, useEffect } from "react";
import '../styles/MyNotes.css';
import api from '../hooks/useAxiosInstance';
import { MdDelete } from "react-icons/md";
import { MdModeEditOutline, MdOutlineCancel } from "react-icons/md";
import { useAuth } from './AuthContext';
import { FaRegSave } from "react-icons/fa";
import { API_URL } from "../utils/api";

interface Note {
  id: string;
  content: string;
}

interface MyNotesProps {
  setFastResponse: (value: boolean) => void;
  setInput: (value: string) => void;
  selectedOption: string;
}

const MyNotes: React.FC<MyNotesProps>= ({ setFastResponse, setInput, selectedOption }) => {
    const [addNote, setAddNote] = useState('')
    const [sendNote, setSendNote] = useState<Note[]>([])
    const { user } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');


    useEffect(() => {
      const getTemplates = async () => {
        try {
          const response = await api.get(`${API_URL}/templates`)
          if (response.status === 200){
            if (selectedOption === "plantillas"){
              setSendNote(response.data.default_templates)
            } else {
              setSendNote(response.data.user_templates)
            }
          }
        } catch (error){
          console.log(error)
        }
      }
      getTemplates();
    }, [selectedOption])

    const validateNote = (e: any) => {
        const note = e.target.value;
        setAddNote(note);
    }

    const handleSendNote = async (e: any) => {
      e.preventDefault()
        if (addNote.trim() !== '') {
          try {
            const response = await api.post(`${API_URL}/templates`, {
              content: addNote,
              user_id: user.id
            })
            setSendNote([response.data, ...sendNote]); 
          } catch(error){
            console.log(error)
          }
          setAddNote(''); 
        }
    }   
    
    const handleSelectNote = (e: any) => {
      if (!editMode){
        const selectedNote = e.target.textContet || e.target.innerText;
        setFastResponse(false);
        setInput(selectedNote);
      }
    }

    const handleKeyDown = (e: any) => {
      if (e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        handleSendNote(e);
      }
    }

    const handleDeleteNote = async (e: any, noteId: string) => {
      e.preventDefault();
      try{
        const response = await api.delete(`${API_URL}/templates/${noteId}`);
        if (response.status === 204){
          setSendNote(prevSendNote => prevSendNote.filter(nota => nota.id !== noteId));
        }
      } catch(error){
        console.log(error)
      }
    }

    const handleEditMode = (e:any, noteId: string, currentContent: string) => {
      e.preventDefault();
      setEditMode(true);
      setEditingNoteId(noteId);
      setEditedContent(currentContent);
    }

    const handleCancelEditing = (e: any) => {
      e.preventDefault();
      setEditMode(false);
      setEditingNoteId(null);
      setEditedContent("");
    }

    const handleSaveEdit = async (e: any, noteId: string) => {
      e.preventDefault();
      if (editedContent.trim() !== ''){
        try {
          const response = await api.put(`${API_URL}/templates/${noteId}`, {
            content: editedContent
          });
          if (response.status === 200){
            setSendNote(prevSendNote => 
              prevSendNote.map(nota =>
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


  return (
    <>
        <div className="notes">  
          {selectedOption==="mis plantillas" && <h3>Mis respuestas</h3>}
          {selectedOption==="plantillas" && <h3>Respuestas disponibles</h3>}
          <div className="note-list">
            {sendNote.map((nota, index) => (
              <div key={index} className="note-item-container">
                <div className={editMode && editingNoteId === nota.id ? "editing-note" : "note-item"} onClick={handleSelectNote}>
                  {editMode && editingNoteId === nota.id ? (
                    <textarea
                      className="area-editing-note"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                  ) : (nota.content)}
                </div>
                {selectedOption==="mis plantillas" && !editMode && <button onClick={(e) => handleEditMode(e, nota.id, nota.content)} className="btns-opt-notes"><MdModeEditOutline className="edit-note-icon" /></button>}
                {selectedOption==="mis plantillas" && !editMode && <button onClick={(e) => handleDeleteNote(e, nota.id)} className="btns-opt-notes"><MdDelete className="delete-note-icon" /></button>}      
                {selectedOption==="mis plantillas" && editMode && editingNoteId === nota.id && <button onClick={(e) => handleSaveEdit(e, nota.id)} className="btns-opt-notes"><FaRegSave className="save-note-icon" /></button>}
                {selectedOption==="mis plantillas" && editMode && editingNoteId === nota.id && <button onClick={(e) => handleCancelEditing(e)} className="btns-opt-notes"><MdOutlineCancel className="cancel-note-icon"/></button>}
              </div>
            ))}
          </div>
          {selectedOption==="mis plantillas" && <div className="notes-text-area">
              <form onSubmit={handleSendNote} className="form-my-notes">
                <textarea
                  placeholder="Ingresar respueta rapida"
                  value={addNote}
                  onChange={validateNote}
                  onKeyDown={handleKeyDown}
                  className="large-texTarea"
                />           
                <button className="btn-save-note" type="submit"> Guardar</button>
              </form>
          </div>}
        </div>
    </>
    )
}

export default MyNotes;
