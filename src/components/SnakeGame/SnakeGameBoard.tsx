import React, { useState, useEffect } from 'react';
import { SnakeProps, UserProps } from '../../utils/Constants';
import { randInt, useInterval } from '../../utils/Functions';
import { fruits } from './Fruits';

interface Props {
  user: UserProps
  isStarted: boolean
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>
  pause: boolean
  setPause: React.Dispatch<React.SetStateAction<boolean>>
  gameOver: boolean
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>
  score: number
  setScore: React.Dispatch<React.SetStateAction<number>>
}

const SnakeGameBoard: React.FC<Props> = ({
  user,
  isStarted, setIsStarted,
  pause, setPause,
  gameOver, setGameOver,
  score, setScore,
}) => {

  const ms = 60;
  const [msCounts, setMsCounts] = useState(0);
  const size = 18;
  const [snake, setSnake] = useState([[2, 2], [2, 1]]);

  const [board, setBoard] = useState(Array.from({ length: size }, () => Array.from({ length: size }, () => '')));
  const [fruit, setFruit] = useState(getRandomPoint(board, snake));
  const [fruitType, setFruitType] = useState('apple');
  const [direction, setDirection] = useState('right'); // up, down, left, right
  
  const [bombs, setBombs] = useState<Array<Array<number>>>([]);
  const [bag, setBag] = useState<Array<Array<string>>>([]);

  // handle touch
  const [touchStart, setTouchStart] = useState<Array<number> | null>(null);
  const [touchEnd, setTouchEnd] = useState<Array<number> | null>(null);
  const minDistance = 10;

  // game loop
  useInterval(() => {
    setMsCounts(msCounts + 1);
    if (!isStarted || pause || msCounts < 2) return;
    // move snake
    const isValidMove = moveSnake();
    // game over
    if (!isValidMove) {
      setGameOver(true);
    }
    setMsCounts(0);
  }, ms);

  useEffect(() => {
    if (isStarted) {
      setSnake([[2, 2], [2, 1]]);
      setDirection('right');
    }
  }, [isStarted]);

  // handle touch events
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameOver || pause) return;
    setTouchEnd(null);
    setTouchStart([e.targetTouches[0].clientX, e.targetTouches[0].clientY]);
  }
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => (!gameOver && !pause) && setTouchEnd([e.targetTouches[0].clientX, e.targetTouches[0].clientY])
  const onTouchEnd = () => {
    if (gameOver || pause) return;
    if (!touchStart || !touchEnd) return
    const distanceX = touchStart[0] - touchEnd[0];
    const distanceY = touchStart[1] - touchEnd[1];
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    // is horizontal
    if (isHorizontalSwipe) {
      const isLeftSwipe = distanceX > minDistance;
      const isRightSwipe = distanceX < -minDistance;
      if (isLeftSwipe && direction !== 'right') {
        setDirection('left');
      } else if (isRightSwipe && direction !== 'left') {
        setDirection('right');
      }
    } else {
      const isUpSwipe = distanceY > minDistance;
      const isDownSwipe = distanceY < -minDistance;
      if (isUpSwipe && direction !== 'down') {
        setDirection('up');
      } else if (isDownSwipe && direction !== 'up') {
        setDirection('down');
      }
    }
  }

  // move snake
  const moveSnake = () => {
    let newSnake = [...snake];
    const nextY = direction === 'up' ? newSnake[0][0] - 1 : direction === 'down' ? newSnake[0][0] + 1 : newSnake[0][0];
    const nextX = direction === 'left' ? newSnake[0][1] - 1 : direction === 'right' ? newSnake[0][1] + 1 : newSnake[0][1];
    // hit the wall
    if (nextX < 0 || nextX >= size || nextY < 0 || nextY >= size) return false;
    // hit the body
    const hitBodyCell = newSnake.find(p => p[0] === nextY && p[1] === nextX);
    if (hitBodyCell && !(hitBodyCell[0] === newSnake[1][0] && hitBodyCell[1] === newSnake[1][1])) return false;
    // hit the bomb
    if (bombs.find(p => p[0] === nextY && p[1] === nextX)) return false;
    
    const nextCell = [nextY, nextX];
    newSnake.unshift(nextCell);
    // eat the fruit in the bag
    if (bag.length > 0 && bag[nextY][nextX] !== '') {
      let newBag = [];
      for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
          if (nextY === i && nextX === j) {
            if (bag[nextY][nextX] === 'apple') {
              setScore(score + 1);
            } else if (bag[nextY][nextX] === 'golden-apple') {
              setScore(score + 3);
            } else if (bag[nextY][nextX] === 'orange') {
              setScore(score + 1);
              newSnake = newSnake.reverse();
              const head = newSnake[0];
              const neck = newSnake[1];
              if (head[0] === neck[0] - 1) {
                setDirection('up');
              } else if (head[0] === neck[0] + 1) {
                setDirection('down');
              } else if (head[1] === neck[1] - 1) {
                setDirection('left');
              } else if (head[1] === neck[1] + 1) {
                setDirection('right');
              }
            }
            row.push('');
          } else {
            row.push(bag[i][j]);
          }
        }
        newBag.push(row);
      }
      if (newBag.filter(row => row.filter(type => type !== '').length > 0).length > 0) {
        setBag(newBag);
      } else {
        setBag([]);
        setFruit(getRandomPoint(board, snake));
        setFruitType(fruits[randInt(0, fruits.length - 1)].name);
      }
    }
    // check if eat the fruit
    if (newSnake[0][0] === fruit[0] && newSnake[0][1] === fruit[1] && bag.length === 0) {
      // don't grow if it's strawberry
      if (fruitType === 'strawberry') {
        newSnake.pop();
      }
      // clear bomb
      setBombs([]);
      // add score
      if (fruitType === 'golden-apple') { // golden apple
        setScore(score + 3); 
      } else if (fruitType === 'orange') { // orange
        setScore(score + 2);
        newSnake = newSnake.reverse();
        const head = newSnake[0];
        const neck = newSnake[1];
        if (head[0] === neck[0] - 1) {
          setDirection('up');
        } else if (head[0] === neck[0] + 1) {
          setDirection('down');
        } else if (head[1] === neck[1] - 1) {
          setDirection('left');
        } else if (head[1] === neck[1] + 1) {
          setDirection('right');
        }
      } else if (fruitType === 'strawberry') {
        setScore(score + 1);
        if (newSnake.length > 4) {
          newSnake = newSnake.slice(0, Math.floor((newSnake.length) / 2));
        } 
      } else { // apple
        setScore(score + 1); 
      }
      // set fruit position
      const randomFruitPos = getRandomPoint(board, snake);
      setFruit(randomFruitPos); // reset fruit
      // set bag
      if (fruitType === 'banana') {
        let newBag = [];
        for (let i = 0; i < size; i++) {
          let row = [];
          for (let j = 0; j < size; j++) {
            if (newSnake.find(p => p[0] === i && p[1] === j) || (i < 5 || i >= size - 5 || j < 5 || j >= size - 5)) {
              row.push('');
            } else {
              row.push(fruits[randInt(0, 3)].name);
            }
          }
          newBag.push(row);
        }
        setBag(newBag);
      }
      // set new fruit type
      if (fruitType === 'watermelon') {
        setFruitType('apple');
        const vertical = Math.random() < 0.5 ? true : false;
        setBombs((vertical ? [[randomFruitPos[0] - 1, randomFruitPos[1]], [randomFruitPos[0] + 1, randomFruitPos[1]]] : [[randomFruitPos[0], randomFruitPos[1] - 1], [randomFruitPos[0], randomFruitPos[1] + 1]]).filter(p => p[0] >= 0 && p[0] < size && p[1] >= 0 && p[1] < size));
      } else {
        setFruitType(fruits[randInt(0, fruits.length - 1)].name);
      }
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
    return true;
  }

  const getHeadDirection = (body: Array<Array<number>>) => {
    const head = body[0];
    const neck = body[1];
    if (neck[0] === head[0] + 1) return 'up';
    if (neck[0] === head[0] - 1) return 'down';
    if (neck[1] === head[1] + 1) return 'left';
    if (neck[1] === head[1] - 1) return 'right';
    return '';
  }

  const getTailStyle = (body: Array<Array<number>>, i: number, j: number) => {
    const frontTail = body[body.length - 2];
    const isTop = frontTail[0] === i - 1;
    const isDown = frontTail[0] === i + 1;
    const isLeft = frontTail[1] === j - 1;
    const isRight = frontTail[1] === j + 1;
    return {
      borderBottomLeftRadius: isTop || isRight ? '50%' : '0px',
      borderBottomRightRadius: isTop || isLeft ? '50%' : '0px',
      borderTopLeftRadius: isDown || isRight ? '50%' : '0px',
      borderTopRightRadius: isDown || isLeft ? '50%' : '0px',
    };
  }

  const getBodyStyle = (body: Array<Array<number>>, i: number, j: number) => {
    const index = body.findIndex(p => p[0] === i && p[1] === j);
    const side1 = body[index - 1];
    const side2 = body[index + 1];
    const isTop = side1[0] === i - 1 || side2[0] === i - 1;
    const isDown = side1[0] === i + 1 || side2[0] === i + 1;
    const isLeft = side1[1] === j - 1 || side2[1] === j - 1;
    const isRight = side1[1] === j + 1 || side2[1] === j + 1;
    if (isTop && isRight) return { borderBottomLeftRadius: '50%' };
    if (isTop && isLeft) return { borderBottomRightRadius: '50%' };
    if (isDown && isRight) return { borderTopLeftRadius: '50%' };
    if (isDown && isLeft) return { borderTopRightRadius: '50%' };
    return {};
  }

  return (
    <div className='snake-game-content' onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className='game-topbar'>
        <div className='game-topbar-score'><span>分數:</span> {score}</div>
        <div className='game-topbar-buttons'>
          <i className='fa-solid fa-pause' onClick={() => setPause(true)}></i>
        </div>
      </div>
      <div className='board-container'>
        <div className='snake-game-board'>
          {board.map((row, i) => {
            return (
              <div className='board-row' key={`row-${i}`}>
                {row.map((cell, j) => {
                  const head = snake[0];
                  const body = [...snake];
                  const tail = snake[snake.length - 1];
                  const isHead = head[0] === i && head[1] === j;
                  const isBody = body.find(p => p[0] === i && p[1] === j);
                  const isTail = tail[0] === i && tail[1] === j;
                  const url = `../images/${fruitType}.png`;
                  return (
                    <div className='board-cell' key={`cell-${i}-${j}`} 
                      style={{ 
                        background: (i + j) % 2 === 0 ? '#ddd' : '#eee',
                      }}
                    >
                      {/* bag */}
                      {(bag.length !== 0 && bag[i][j]) && <div className='fruit-cell'>
                        <img src={`../images/${bag[i][j]}.png`}/>
                      </div>}
                      {/* fruit */}
                      {(fruit[0] === i && fruit[1] === j && bag.length === 0) && <div className='fruit-cell'>
                        <img src={url}/>
                      </div>}
                      {/* bombs */}
                      {bombs.find(p => p[0] === i && p[1] === j) && <div className='fruit-cell'>
                        <img src={'../images/bomb.png'}/>
                      </div>}
                      {/* snake */}
                      {isBody && <div className='snake-cell' style={ isHead ? {
                        background: user.color,
                        borderTopLeftRadius: getHeadDirection(body) === 'up' || getHeadDirection(body) === 'left' ? '50%' : '0px',
                        borderTopRightRadius: getHeadDirection(body) === 'up' || getHeadDirection(body) === 'right' ? '50%' : '0px',
                        borderBottomLeftRadius: getHeadDirection(body) === 'down' || getHeadDirection(body) === 'left' ? '50%' : '0px',
                        borderBottomRightRadius: getHeadDirection(body) === 'down' || getHeadDirection(body) === 'right' ? '50%' : '0px',
                      } : isTail ? {
                        background: user.color,
                        ...getTailStyle(body, i, j)
                      } : {
                        background: user.color,
                        ...getBodyStyle(body, i, j),
                      }}/>}
                      {/* snake head */}
                      {isHead && <div className={`snake-head ${getHeadDirection(body)}`} style={{ background: user.color }}>
                        <img src='../images/snake-eyes.png'/>
                      </div>}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      <div className='game-directions'>
        <div className='directions-row top'>
          <i className='fa-solid fa-caret-up' onClick={() => direction !== 'down' && setDirection('up')}></i>
        </div>
        <div className='directions-row middle'>
          <i className='fa-solid fa-caret-left' onClick={() => direction !== 'right' && setDirection('left')}></i>
          <i className='fa-solid fa-caret-left' style={{ opacity: 0 }}></i>
          <i className='fa-solid fa-caret-right' onClick={() => direction !== 'left' && setDirection('right')}></i>
        </div>
        <div className='directions-row bottom'>
          <i className='fa-solid fa-caret-down' onClick={() => direction !== 'up' && setDirection('down')}></i>
        </div>
      </div>
    </div>
  )
}

export default SnakeGameBoard;

const getRandomPoint = (board: Array<Array<string>>, snake: Array<Array<number>>) => {
  let point = [randInt(0, board.length), randInt(0, board.length)];
  const head = snake[0];
  const body = [...snake];
  while (
    (Math.abs(point[0] - head[0]) < 3 || Math.abs(point[1] - head[1]) < 3) || // if too close to head
    body.find(p => p[0] === point[0] && p[1] === point[1]) // is the body
  ) {
    point = [randInt(0, board.length), randInt(0, board.length)];
  }
  return point;
};