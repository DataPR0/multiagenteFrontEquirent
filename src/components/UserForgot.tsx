import '../styles/UserForgot.css';
import { FaLock} from 'react-icons/fa';
import { IoMdMail } from "react-icons/io";
import { IoMdReturnRight } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useState} from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const UserForgot = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState('');

    const validateEmail = (e: any) => {
      const emailValue = e.target.value;
      setEmail(emailValue)
    }

    const validatePassword = (e: { target: { value: any; }; }) => {
      const password = e.target.value;
      setPassword(password);
    }

    const handleSubmit = async (e:any) => {
      e.preventDefault();

      if (!email || !password) {
        setMessage("Los datos ingresados son incorrectos ");
        return;
      } 

      try {
        const bodyData = new FormData();
        bodyData.append('email', email );
        bodyData.append('password', password);

        const response =  await axios.post(`${API_URL}/auth/forgot-username`, bodyData, {
          headers:{
            "Content-Type": "multipart/form-data"
          },
        })

        const data = response.data

        if(data.success){
          setUser(data.username)
          setMessage('');
        }else{
          setUser('');
          setMessage(data.message)
        }

      }catch(error:any){
        if (error.response) {
          if (error.response.status === 400) {
            setMessage("Correo electrónico no encontrado.");
          } else if (error.response.status === 401) {
            setMessage("Contraseña incorrecta.");
          } else {
            setMessage("Hubo un error al procesar la solicitud.");
          }
        } else {
          setMessage("Error de conexión, por favor intente más tarde.");
        }
    }
    }

    const handleClose = () => {
      navigate('/login');
    }  
  
    return (
    <div className='container-forgot'>
      <div className='password-forgot'>
        <h2 className='tittle'>Ingresar datos para establecer usuario</h2>
        <button className="btn-close-forgot" onClick={handleClose}><IoMdReturnRight className="btn-close-forgot" /></button>
          <form className="user-form"  onSubmit={handleSubmit}>  
              <div className="form-group"> 
                <input
                  type="email"
                  placeholder="Ingresar correo"
                  value={email}
                  onChange={validateEmail}
                />
                <i><IoMdMail /></i>
              </div>
              <div className="form-group"> 
                <input
                  type="password"
                  placeholder="Ingresar contraseña"
                  value={password}
                  onChange={validatePassword}
                />
                <i><FaLock /></i>
              </div>          
              <button
                  type="submit"
                  className="login-button"
              > Enviar solicitud
              </button>
          </form>
          {message && <p className="message-user">{message}</p>} 
          {user && <p className='user'>Tu usuario es: <span className="user-validate">{user}</span></p>} 
      </div>
      </div>
    )
}

export default UserForgot
