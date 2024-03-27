import { createCoordsString, getWidthHeightFromCoords } from "../utils";
import { cellSize, GameMode } from "../common";
import "./Board.css";

export default function Board(props) {
  const makeUsualCell = (event) => {
    const cellId = event.target.id;
    props.removeHole(cellId);
  };

  const chooseHole = (event) => {
    const cellId = event.target.id;
    props.addHole(cellId);
  };

  const createCircle = (circle, whiteOrBlack, isPossibleMove) => {
    const widthHeight = getWidthHeightFromCoords(circle);
    if (widthHeight == null) {
      return;
    }

    const width = widthHeight[0];
    const height = widthHeight[1];
    const className = isPossibleMove
      ? "possible-move "
      : "circle " + whiteOrBlack;
    return (
      <div
        id={"circle-" + circle}
        key={"circle-" + circle}
        className={className}
        style={{
          top: height * cellSize + "px",
          left: width * cellSize + "px",
        }}
      ></div>
    );
  };

  return (
    <div className="board-frame">
      <div className="numbers">
        {[...Array(props.width).keys()].map((i) => (
          <div key={i} className="coord">
            {i}
          </div>
        ))}
      </div>

      <div className="letters">
        {[...Array(props.height).keys()].map((i) => (
          <div key={i} className="coord">
            {String.fromCharCode(97 + i)}
          </div>
        ))}
      </div>

      <div
        className="board"
        style={{
          width: cellSize * props.width + "px",
          height: cellSize * props.height + "px",
        }}
      >
        {props.gameMode === GameMode.CREATING &&
          [...Array(props.width).keys()].map((i) => (
            <div key={i}>
              {[...Array(props.height).keys()].map((j) => {
                const key = createCoordsString(i, j);
                if (props.holes.includes(key)) {
                  return (
                    <div
                      id={key}
                      key={key}
                      className="cell hole hole-creating-mode"
                      onClick={makeUsualCell}
                    ></div>
                  );
                }
                return (
                  <div
                    id={key}
                    key={key}
                    className="cell potential-hole"
                    onClick={chooseHole}
                  ></div>
                );
              })}
            </div>
          ))}
        {(props.gameMode === GameMode.PLAYING ||
          props.gameMode === GameMode.ENDED) &&
          [...Array(props.width).keys()].map((i) => (
            <div key={i}>
              {[...Array(props.height).keys()].map((j) => {
                const key = createCoordsString(i, j);
                if (props.holes.includes(key)) {
                  return <div id={key} key={key} className="cell hole"></div>;
                }
                return <div id={key} key={key} className="cell"></div>;
              })}
            </div>
          ))}
        {props.whiteCircles &&
          props.whiteCircles.map((whiteCircle) =>
            createCircle(whiteCircle, "white", false)
          )}
        {props.blackCircles &&
          props.blackCircles.map((blackCircle) =>
            createCircle(blackCircle, "black", false)
          )}
        {props.highlightPossibleMoves &&
          props.possibleMoves &&
          props.possibleMoves.map((possibleMove) =>
            createCircle(possibleMove, "", true)
          )}

        {props.userTurn &&
          props.gameMode === GameMode.PLAYING &&
          props.possibleMoves &&
          props.possibleMoves.map((possibleMove) => {
            const widthHeight = getWidthHeightFromCoords(possibleMove);
            if (widthHeight == null) {
              return null;
            }

            const width = widthHeight[0];
            const height = widthHeight[1];
            return (
              <div
                id={"transparent-" + possibleMove}
                key={"transparent-" + possibleMove}
                className="clickable"
                onClick={() => {
                  props.userPlayed(possibleMove);
                }}
                style={{
                  top: height * cellSize + "px",
                  left: width * cellSize + "px",
                }}
              ></div>
            );
          })}
      </div>

      <div className="numbers-two">
        {[...Array(props.width).keys()].map((i) => (
          <div key={i} className="coord">
            {i}
          </div>
        ))}
      </div>

      <div className="letters-two">
        {[...Array(props.height).keys()].map((i) => (
          <div key={i} className="coord">
            {String.fromCharCode(97 + i)}
          </div>
        ))}
      </div>
    </div>
  );
}
