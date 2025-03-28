import React, { useState, useEffect } from 'react';
import '../styles/Collection.css';
import { IoCloseCircleOutline } from "react-icons/io5";
import { motion } from 'framer-motion';

interface CollectionProps {
  setCollection: (value: boolean) => void;
}

export const Collection: React.FC<CollectionProps> = ({ setCollection }) => {
  const [data,setData] = useState([])

  const handleClose = () => {
    setCollection(false);
  };


  const url = 'https://jsonplaceholder.typicode.com/posts' // url de ejemplo

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setData(data); 
      } catch (err) {
        console.log( err);
      }
    };

    fetchData(); 
  }, []); 

  // if (!clickClose) {
  //   return null; 
  // }

  return (
    <motion.div className='gray-back'
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    >
      <div className='collection-container'>
        <button className="btn-close" onClick={handleClose}>
          <IoCloseCircleOutline className="btn-close-icon" />
        </button>
        <h1>Resumen chat</h1>
        <div className="main-content">
          <div className="summary">
            {data.map((body: any) => (
              <p className="sumary-content"  key={body.id}>{body.body}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>     
  );
};
