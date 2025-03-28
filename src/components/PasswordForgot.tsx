import '../styles/PasswordForgot.css';
import { IoMdMail } from "react-icons/io";
import { IoMdReturnRight } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useState} from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';


const PasswordForgot = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (e: any) => {
    const emailValue = e.target.value;
    setEmail(emailValue)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!email) {
      setMessage("Por favor, ingresa un correo electrónico valido.");
      return;
    } 

    try{
      const bodyData = new FormData();
      bodyData.append('email', email );

      const response =  await axios.post(`${API_URL}/auth/reset`, bodyData, {
        headers:{
          "Content-Type": "multipart/form-data"
        },
      })
      console.log(response)
      const data = response.data;
      
      if (data.success) {
        setMessage('Te hemos enviado un correo electrónico para recuperar tu contraseña.');
      } else {
        setMessage('No pudimos encontrar ese correo electrónico. Intenta de nuevo.');
      }
      
    }catch(error){
      console.log(error)
  }
  }

  const handleClose = () => {
    navigate('/login');
  }  

  return (
    <div className='container-forgot'>
      <div className='password-forgot'>
      <h2 className='tittle'>Ingresar datos para establecer contraseña</h2>
      <button className="btn-close-forgot" onClick={handleClose}><IoMdReturnRight className="btn-close-forgot" /></button>
        <form className="login-form" onClick={handleSubmit} >
            <div className="form-group"> 
                <input
                    type="email"
                    placeholder="Ingresar correo"
                    value={email}
                    onChange={validateEmail}
                    className='input-forgot'
                />
            <i><IoMdMail /></i>
            </div>             
            <button
                    type="submit"
                    className="login-button"
            > Enviar solicitud
            </button>
            </form>
            <p className='message-forgot'>{message}</p>
        </div>
    </div>
  )
}

export default PasswordForgot
