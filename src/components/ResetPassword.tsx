import { FaLock} from 'react-icons/fa';
import { useState} from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../utils/api';

const ResetPassword = () => {

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [param] = useSearchParams();

  const myParam = param.get('token')
  
  const validateNewPassword = (e: any) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue)
  }


  const validateConfirmPassword = (e: any) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue)
  }

  const handleSubmit = async (e: any) => {
    console.log(typeof myParam)
    e.preventDefault();

    if (newPassword !== confirmPassword) {
        setMessage('Las contraseñas no coinciden.');
        return;
    }

    if(newPassword.length < 7){
        setMessage(' La contraseña debe ser mayor a 7 caracteres' )
        return;
    }

    try {
        const bodyData = new FormData();
        bodyData.append('password', newPassword );
        bodyData.append('reset_token', String(myParam))
  
        const response =  await axios.post(`${API_URL}/auth/change-password`, bodyData, {
          headers:{
            "Content-Type": "multipart/form-data"
          },
        })
        console.log(response)
        const data = response.data;
        
        if (data.success) {
          setMessage('Tu contraseña ha sido actualizada con éxito. <a href="/login">Iniciar sesión</a>');
        } else {
          setMessage('Hubo un error al actualizar la contraseña.');
        }
        
    }catch(error){
        console.log(error)
    }
  }

  return (
    <div className='container-forgot'>
      <div className='password-forgot'>
        <h2 className='tittle'>Cambiar contraseña </h2>
          <form className="login-form"  onSubmit={handleSubmit}>
              <div className="form-group"> 
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                placeholder="Ingresar contraseña"
                value={newPassword}
                onChange={validateNewPassword}
              />
              <i><FaLock /></i>
              </div>
              <div className="form-group"> 
              <label>Confirmar Contraseña:</label>
              <input
                type="password"
                placeholder="Ingresar contraseña"
                value={confirmPassword}
                onChange={validateConfirmPassword}
              />
              <i><FaLock /></i>
              </div>            
              <button
                      type="submit"
                      className="login-button"
              > Restablecer Contraseña
              </button>
          </form>
          <div dangerouslySetInnerHTML={{ __html: message }}  className='message-forgot'/>
        </div>
      </div>
  )
}

export default ResetPassword
