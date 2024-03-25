import { useState } from "react";
import "./App.css";
import Preparation from "./components/Preparation";
import Game from "./components/Game";
import { GameMode, defaultWidth, defaultHeight, Player } from "./common";

function App() {
  const [gameMode, setGameMode] = useState(GameMode.PLAYING);
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [holes, setHoles] = useState([]);
  const [firstPlayer, setFirstPlayer] = useState(Player.USER);
  const [secondPlayer, setSecondPlayer] = useState(Player.BOT);

  const startGame = (width, height, holes, firstPlayer, secondPlayer) => {
    setWidth(width);
    setHeight(height);
    setHoles(holes);
    setGameMode(GameMode.PLAYING);
    setFirstPlayer(firstPlayer);
    setSecondPlayer(secondPlayer);
  };

  const restart = () => {
    setGameMode(GameMode.CREATING);
  };

  return (
    <div className="App">
      {gameMode === GameMode.CREATING && <Preparation startGame={startGame} />}
      {gameMode === GameMode.PLAYING && (
        <Game
          width={width}
          height={height}
          holes={holes}
          firstPlayer={firstPlayer}
          secondPlayer={secondPlayer}
          restart={restart}
        />
      )}
    </div>
  );
}

export default App;
