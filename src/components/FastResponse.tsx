import { useState } from "react";
import MyNotes from "../components/MyNotes";
import { motion } from 'framer-motion';
import '../styles/FastResponse.css';
import { IoCloseCircleOutline } from "react-icons/io5";

interface FastResponseProps {
  setFastResponse: (value: boolean) => void;
  setInput: (value: string) => void;
}

const FastResponse: React.FC<FastResponseProps> = ({ setFastResponse, setInput }) => {

    const [selectedOption, setSelectedOption] = useState('');
    const [clickTemplates, setClickTemplates] = useState(false);

    const handleSelectOption = (option: any) => {
      console.log(option)
      setSelectedOption(option)
      setClickTemplates(true)
    }

    const handleCloseResponse = () => {
      setClickTemplates(false)
      setFastResponse(false);
    }

  return (
    <>
        <motion.div className="gray-back"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >  
        <div className="fast-response-container">
        <button className="btn-close" onClick={handleCloseResponse}><IoCloseCircleOutline className="btn-close-icon"/></button>
          <h3>Respuestas rapidas</h3>
          <div className="container-btns-templates">  
            <button className="btns-templates" onClick={() => handleSelectOption('plantillas')}>Plantillas</button>
            <button className="btns-templates" onClick={() => handleSelectOption('mis plantillas')}>Mis Respuestas</button>
          </div>
          <div className="showNotes">
            {clickTemplates && < MyNotes setFastResponse={setFastResponse} setInput={setInput} selectedOption={selectedOption}/>}
          </div>
        </div>
        </motion.div>
    </>
    )
}

export default FastResponse;
