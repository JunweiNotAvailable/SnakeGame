import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SnakeGame from './components/SnakeGame/SnakeGame';
import { RecordProps, UserProps } from './utils/Constants';
import axios from 'axios';
import config from './config.json';
import Login from './components/Login/Login';
import { getRandomHexColor } from './utils/Functions';

function App() {

  const [user, setUser] = useState<UserProps | null>(null);
  const [records, setRecords] = useState<RecordProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRecords() {
      const res: RecordProps[] = (await axios.get(`${config.api.invokeUrl}/scan`, { params: { table: 'PlayTime-GameScores' } })).data;
      setRecords(res.sort((a, b) => b.score - a.score));
      setLoading(false);
    }
    loadRecords();
    const currUsername = window.localStorage.getItem('playTimeUsername');
    if (currUsername) {
      loadUser(currUsername);
    }
  }, []);

  // load user
  const loadUser = async (username: string) => {
    setLoading(true);
    const userData: UserProps = (await axios.get(`${config.api.invokeUrl}/single`, {params: { table: 'Laijoig-Users', id: 'junwei_0551' }} )).data.Item;
    if (userData) {
      setUser(userData);
    }
    window.localStorage.setItem('playTimeUsername', username);
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {user ? <Route path='/' element={<SnakeGame
            user={user}
            records={records} setRecords={setRecords}
          />}/>
          : 
          <Route path='/' element={<Login
            user={user}
            loadUser={loadUser}
            loading={loading}
          />}/>}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
