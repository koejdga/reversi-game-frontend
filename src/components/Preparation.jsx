import React, { useState } from "react";
import "./Preparation.css";
import { defaultWidth, defaultHeight, GameMode, Player } from "../common";
import Board from "./Board";
import { createCoordsString } from "../utils";

export default function Preparation(props) {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [holes, setHoles] = useState([]);
  const [amountOfHoles, setAmountOfHoles] = useState(1);

  const [firstPlayer, setFirstPlayer] = useState(Player.USER);
  const [secondPlayer, setSecondPlayer] = useState(Player.BOT);

  const handleFirstPlayerChange = (event) => {
    setFirstPlayer(event.target.value === "user" ? Player.USER : Player.BOT);
  };

  const handleSecondPlayerChange = (event) => {
    setSecondPlayer(event.target.value === "user" ? Player.USER : Player.BOT);
  };

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  };

  const generateRandomHoles = () => {
    let amount = amountOfHoles;
    let newHoles = [];

    let randomWidth = getRandomInt(width);
    let randomHeight = getRandomInt(height);
    let str = createCoordsString(randomWidth, randomHeight);

    while (amount > 0) {
      if (!holes.includes(str)) {
        amount--;
        newHoles.push(str);
      }

      randomWidth = getRandomInt(width);
      randomHeight = getRandomInt(height);
      str = createCoordsString(randomWidth, randomHeight);
    }

    setHoles((prevHoles) => [...prevHoles, ...newHoles]);
  };

  const removeHole = (cellId) => {
    setHoles((prevHoles) => prevHoles.filter((item) => item !== cellId));
  };

  const addHole = (cellId) => {
    setHoles((prevHoles) => [...prevHoles, cellId]);
  };

  return (
    <div className="main">
      <form className="config-board-grid">
        <section className="select-field-size">
          <h1>Reversi Game</h1>

          <h6>Розмір поля</h6>
          <div className="input-unit">
            <p>Ширина</p>
            <input
              name="width"
              id="width"
              defaultValue={defaultWidth}
              placeholder={defaultWidth}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (!isNaN(newValue)) setWidth(newValue);
                else setWidth(defaultWidth);
              }}
            />
          </div>
          <div className="input-unit">
            <p>Висота</p>
            <input
              name="height"
              id="height"
              defaultValue={defaultHeight}
              placeholder={defaultHeight}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (!isNaN(newValue)) setHeight(newValue);
                else setHeight(defaultHeight);
              }}
            />
          </div>
        </section>

        <section className="side-part select-players">
          <h6>Хто грає</h6>
          <div>
            <label htmlFor="player1-select">Першим грає:</label>
            <select
              value={firstPlayer === Player.USER ? "user" : "bot"}
              onChange={handleFirstPlayerChange}
              name="player1"
              id="player1-select"
            >
              <option value="user">User</option>
              <option value="bot">Bot</option>
            </select>
          </div>

          <div>
            <label htmlFor="player2-select">Другим грає:</label>
            <select
              value={secondPlayer === Player.USER ? "user" : "bot"}
              onChange={handleSecondPlayerChange}
              name="player2"
              id="player2-select"
            >
              <option value="user">User</option>
              <option value="bot">Bot</option>
            </select>
          </div>
        </section>

        <section className="side-part choose-holes-menu">
          <h6>Оберіть чорні діри</h6>
          <div className="random-generation">
            <button
              id="generate-random"
              type="button"
              onClick={() => generateRandomHoles()}
            >
              Згенерувати випадково
            </button>
            <div id="choose-holes-amount">
              <p>Кількість:</p>
              <input
                name="amount-of-holes"
                id="amount-of-holes"
                value={amountOfHoles}
                onChange={(event) => {
                  const newValue = parseInt(event.target.value);
                  if (!isNaN(newValue)) setAmountOfHoles(newValue);
                  else setAmountOfHoles(0);
                }}
              />
            </div>
          </div>
          <button type="button" id="clear-button" onClick={() => setHoles([])}>
            Очистити
          </button>
        </section>

        <section className="board">
          <Board
            width={width}
            height={height}
            holes={holes}
            removeHole={removeHole}
            addHole={addHole}
            gameMode={GameMode.CREATING}
          />
        </section>

        <button
          type="button"
          id="start-button"
          onClick={() =>
            props.startGame(width, height, holes, firstPlayer, secondPlayer)
          }
        >
          Розпочати
        </button>
      </form>

      <script src="common.js"></script>
      <script src="index.js"></script>
    </div>
  );
}
