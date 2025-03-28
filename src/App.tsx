import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom';
import Login from './components/Login'
import Chat from './components/Chat';
import PasswordForgot from './components/PasswordForgot';
import UserForgot from './components/UserForgot'
import './App.css';
import AuthContext  from './components/AuthContext';
import ProtectedChat from './components/ProtectedChat';
import ResetPassword from './components/ResetPassword';
import AdminView from './components/AdminView';
import ProtectedAdmin from './components/ProtectedAdmin';


function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedChat />}>
          <Route path="/chat" element={<Chat /> } />  
        </Route>

        <Route path='/admin' element={<ProtectedAdmin />}>
          <Route path="/admin" element={<AdminView />} />
        </Route>
        

        <Route path="/password-forgot" element={<PasswordForgot />}/>
        <Route path="/user-forgot" element={<UserForgot />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path='*' element={<Navigate to='/login' replace />} />
      </>
    )
  )

  return (
    <AuthContext>
      <div>
        <RouterProvider router={router}></RouterProvider>
      </div>
    </AuthContext>
  )
}

export default App;
