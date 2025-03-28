import { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import equirentLogo from '../assets/equirent.png';
import dataproLogo from '../assets/dataPro.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [user,setUser] = useState('');
  const [password,setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errors, setErrors] = useState('');

  const validateUser = (e: any) => {
    const userValue = e.target.value;
    setUser(userValue);
  }
  

  const validatePassword = (e: { target: { value: any; }; }) => {
    const password = e.target.value;
    setPassword(password);
    setPasswordError(password.length < 6 ? ' La contraseña debe ser mayor a 7 caracteres' : '')
  }

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try{
      var bodyData = new FormData();
      bodyData.append('username', user);
      bodyData.append('password', password);
      await login(bodyData)
      navigate('/chat');
      // 200 401 y 422
    } catch(error) {
      console.log(error)
      setErrors("Credenciales no válidas")
    }
    
  }

  const handleForgotPassword = () => {
    navigate('/password-forgot');
  }

  const handleForgotUser = () => {
    navigate('/user-forgot');
  }

  return (
    <div className='login'>
      <div className="login-Container">
        <div className="logos-section">
          <div className="logos-container">
            <img
              src={equirentLogo}
              alt="Equirent"
              className="company-logo"
            />
            <img
              src={dataproLogo}
              alt="DataPro"
              className="company-logo"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2 className='tittle-login'>Multi-Agente</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <i><FaUser /></i>
              <input
                type="text"
                placeholder="Ingresar usuario"
                value={user}
                onChange={validateUser}
              />
            </div>
            <div className="form-group">
              <i><FaLock /></i>
              <input
                type="password"
                placeholder="Ingresar contraseña"
                value={password}
                onChange={validatePassword}
                className={passwordError ? 'error' : ''}
              />
            </div>
            <button type="submit" className="login-button">
              Ingresar
            </button>
            {errors && <div className="error-message">{errors}</div>}
            {passwordError && <div className="error-message">{passwordError}</div>}
          </form>
          <div className="forgot-password">
            <a onClick={handleForgotPassword}>¿Olvidaste tu contraseña?</a>
            <a onClick={handleForgotUser}>¿Olvidaste tu usuario?</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
