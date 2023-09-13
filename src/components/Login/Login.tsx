import React, { useState, useEffect } from 'react';
import './style.css';
import { UserProps } from '../../utils/Constants';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: UserProps | null
  loadUser: (username: string) => Promise<void>
  loading: boolean
}

const Login: React.FC<Props> = ({ user, loadUser, loading }) => {

  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }
  }, [user]);

  const handleLogin = async () => {
    await loadUser(username);
  };

  return (
    <div className='login-form'>
      <div className='login-title'>登入</div>
      <div className='form-input-group'>
        <label>怎麼稱呼你 <span style={{ fontSize: 12, fontWeight: 'normal' }}>( 請跟第一次輸入的一樣喔 )</span></label>
        <input placeholder='名字' value={username} onInput={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}/>
      </div>
      <button className={`login-button${username.length === 0 || loading ? ' disabled' : ''}`} disabled={username.length === 0 || loading} onClick={handleLogin}>開始</button>
    </div>
  )
}

export default Login