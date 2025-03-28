import React, { useState } from 'react';
import '../styles/Typify.css';
import { motion } from 'framer-motion';
import { IoCloseCircleOutline } from "react-icons/io5";
import api from '../hooks/useAxiosInstance';
import { dataTipologias } from '../data/tipologias';
import { API_URL } from '../utils/api';

interface TypifyProps {
  handleEndChat: () => void;
  chatId: string | null;
}


const Typify: React.FC<TypifyProps> = ({ handleEndChat, chatId }) => {

  const [selectedMotive, setSelectedMovite] = useState("");
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<string[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  

  const handleFinishConversation = async () => {
    try {
      await api.post(`${API_URL}/conversations/${chatId}/endChat`, {
        motive: selectedMotive,               
        filteredSubcategorias: selectedSubcategory, 
        client_id: 1234567890                
      });
      handleEndChat();
    } catch (error) {
      console.error("Error al finalizar la conversación:", error);
    }
  };

  const handleChangeMotive = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMovite(value);

    const subcategorias = dataTipologias[value] || [];
    const filtered = subcategorias.filter((sub): sub is string => sub !== null);

  setFilteredSubcategorias(filtered);
  }

  const hadleSubCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSubcategory(value)

  }
  
  return (
    <>
    <motion.div className="typify"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    >
      <div className="container-Typify"> 
        <div className='typify-menu'>
        <button className="btn-close" onClick={handleEndChat}><IoCloseCircleOutline className="btn-close-icon"/></button>
        <h4 className='tittle'>Finalizar chat</h4>
        <div className = 'form'>
          <h6>Motivo</h6>
          <label className='type-select'>
            <select  value={selectedMotive} onChange={handleChangeMotive} className="select-input">
              {Object.keys(dataTipologias).map((tipologia, index) => (
                <option  key={index} value={tipologia} >
                  {tipologia }
                </option>
              ))}
            </select>
            <h6>Subcategoría</h6>
            {filteredSubcategorias.length > 0 ? (
              <select className="select-input"
                     value={selectedSubcategory}
                     onChange={hadleSubCategory}
              > 
                {filteredSubcategorias.map((subcat, index) => (
                  <option key={index} value={subcat} >
                      {subcat}
                  </option>
              ))}
              </select>
            ): selectedMotive && (
              <p>No hay subcategorías disponibles.</p>
            )}
          </label>
          <button onClick={handleFinishConversation} className='button-send'>Enviar</button>
        </div>
        </div>  
      </div>
    </motion.div>
    </>
  )
}

export default Typify;