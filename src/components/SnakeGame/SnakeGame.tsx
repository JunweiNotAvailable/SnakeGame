import React, { useState, useEffect } from 'react'
import { RecordProps, UserProps } from '../../utils/Constants'
import './style.css';
import { useNavigate } from 'react-router-dom';
import SnakeGameBoard from './SnakeGameBoard';
import axios from 'axios';
import config from '../../config.json';
import { fruits } from './Fruits';

interface Props {
  user: UserProps | null
  records: RecordProps[]
  setRecords: React.Dispatch<React.SetStateAction<RecordProps[]>>
}

const SnakeGame: React.FC<Props> = ({ user, records, setRecords }) => {

  const navigate = useNavigate();
  const [bestScore, setBestScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [pause, setPause] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [showFruits, setShowFruits] = useState(false);
  
  useEffect(() => {
    setBestScore(records.find(r => r.id === user?.name)?.score || 0);
  }, [records]);

  useEffect(() => {
    if (isStarted) {
      setScore(0);
      setGameOver(false);
      setPause(false);
    }
  }, [isStarted]);

  useEffect(() => {
    if (gameOver && user) {
      let ranking = 0;
      const newRecord: RecordProps = {
        id: user.name,
        ranking: ranking,
        user: user,
        score: score,
        details: 'snakeGame',
      };
      let newRecords = records.find(r => r.id === user.name) ? records.map(r => r.id === user.name && r.score < score ? newRecord : r) : [...records, newRecord];
      newRecords = newRecords.sort((a, b) => b.score - a.score).map((r, i) => {
        return { ...r, ranking: i + 1 };
      });
      setRecords(newRecords);
      for (const r of newRecords) {
        axios.post(`${config.api.invokeUrl}/rankings`, r);
      }
    }
  }, [gameOver]);


  return (
    user &&
    <div className='snake-game'>
      <div className='snake-game-body'>
        <SnakeGameBoard
          user={user}
          isStarted={isStarted} setIsStarted={setIsStarted}
          pause={pause} setPause={setPause}
          gameOver={gameOver} setGameOver={setGameOver}
          score={score} setScore={setScore}
        />
        {(!isStarted && !gameOver) && <div className='game-home'>
          <div className='show-fruits-section'>
            <div className='show-fruits-button' onClick={() => setShowFruits(true)}>
              <img src='../images/golden-apple.png'/>
            </div>
          </div>
          <div className='game-logo large'>
            <img src='../images/snake-game-logo.png'/>
          </div>
          <div className='game-home-title'>貪吃蛇</div>
          <div className='game-home-scores'>
            <div className='current-score'>分數: {score}</div>
            <div className='best-score'>最高分: {bestScore}</div>
          </div>
          <button className='game-home-button' onClick={() => setIsStarted(true)}><i className='fa-solid fa-play'></i>開始遊戲</button>
          <button className='game-home-button' onClick={() => setShowRanking(true)}><i className='fa-solid fa-trophy'></i>排行榜</button>
        </div>}
        {pause && <div className='game-home'>
          <div className='show-fruits-section'>
            <div className='show-fruits-button' onClick={() => setShowFruits(true)}>
              <img src='../images/golden-apple.png'/>
            </div>
          </div>
          <div className='game-logo large'>
            <img src='../images/snake-game-logo.png'/>
          </div>
          <div className='game-home-title'>暫停遊戲</div>
          <div className='game-home-scores'>
            <div className='current-score'>分數: {score}</div>
          </div>
          <button className='game-home-button' onClick={() => setPause(false)}><i className='fa-solid fa-play'></i>繼續</button>
          <button className='game-home-button' onClick={() => {
            setGameOver(false);
            setPause(false);
            setIsStarted(false);
          }}>回首頁</button>
        </div>}
        {gameOver && <div className='game-home'>
          <div className='game-logo large'>
            <img src='../images/snake-game-logo.png'/>
          </div>
          <div className='game-home-title'>哇！你掛了</div>
          <div className='game-home-scores'>
            <div className='current-score'>分數: {score}</div>
          </div>
          <button className='game-home-button' onClick={() => {
            setGameOver(false);
            setPause(false);
            setIsStarted(false);
          }}>回首頁</button>
        </div>}
        {showRanking && <div className='game-ranking'>
          <div className='game-ranking-window'>
            <div className='game-window-topbar'>
              <div className='game-window-title'>排行榜</div>
              <i className='fa-solid fa-times' onClick={() => setShowRanking(false)}></i>
            </div>
            <div className='game-ranking-list'>
              {records.map((record, i) => {
                return (
                  <div className='game-record' key={`record-${i}`} style={{ background: record.user.color + '11' }}>
                    <div>{record.ranking}</div>
                    <div>{record.id + (record.id === '嘎0' ? ' (維宸玩的)' : record.id === '峻緯' ? ' (吃蛋糕嘍)' : record.id === '宀辰' ? ' (尼要怎樣)' : record.id === '友誼' ? '(來變魔術！)' : record.id === '疫情' ? '(好想睡覺...)' : record.id === '小黑' ? '(霖霖好想你)' : record.id === '賴賴' ? ' (甜不賴)' : '')}</div>
                    <div>{record.score}</div>
                    <div style={{ color: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--silver)' : 'var(--bronze)' }}>{i < 3 && <i className='fa-solid fa-trophy'></i>}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>}
        {showFruits && <div className='game-fruits'>
          <div className='game-ranking-window'>
            <div className='game-window-topbar'>
              <div className='game-window-title'>水果們</div>
              <i className='fa-solid fa-times' onClick={() => setShowFruits(false)}></i>
            </div>
            <div className='game-fruits-list'>
              {fruits.map((fruit, i) => {
                return (
                  <div className='fruit-group' key={`fruit-${i}`}>
                    <div className='fruit-group-image'>
                      <img src={`../images/${fruit.name}.png`}/>
                    </div>
                    <div className='fruit-description'>{fruit.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>}
      </div>
    </div>
  )
}

export default SnakeGame