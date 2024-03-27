import { Player } from "./common";

export const createCoordsString = (width, height) => {
  return `w${width}h${height}`;
};

export const getWidthHeightFromCoords = (key) => {
  const matches = key.match(/w(\d+)h(\d+)/);

  if (matches) {
    const width = parseInt(matches[1]);
    const height = parseInt(matches[2]);
    return [width, height];
  } else {
    console.log("ERROR: Wrong circle format provided");
    return null;
  }
};

export const convertCoordsToSend = (coordsString) => {
  return { dot: getWidthHeightFromCoords(coordsString) };
};

export const convertCoordListToSend = (list) => {
  return list.map((dotCoords) => convertCoordsToSend(dotCoords));
};

export const convertDotToCoords = (dotObj) => {
  if (dotObj.dot === undefined || dotObj.dot.length !== 2) {
    console.log("ERROR: invalid object provided to create a dot");
    return;
  }
  return createCoordsString(dotObj.dot[0], dotObj.dot[1]);
};

export const convertChangesToCoords = (changesObj) => {
  if (changesObj.changes === undefined) {
    console.log(
      "ERROR: invalid object provided to return changes (array of dots)"
    );
    return;
  }
  return convertDotsToCoordsList(changesObj.changes);
};

export const convertDotsToCoordsList = (list) => {
  return list.map((dotObj) => convertDotToCoords(dotObj));
};

export const getPlayerNames = (firstPlayer, secondPlayer) => {
  if (firstPlayer === Player.USER && secondPlayer === Player.USER) {
    return { firstPlayerName: "Player 1", secondPlayerName: "Player 2" };
  }

  if (firstPlayer === Player.BOT && secondPlayer === Player.BOT) {
    return { firstPlayerName: "Bot 1", secondPlayerName: "Bot 2" };
  }

  const playerNames = {
    [Player.USER]: "Player",
    [Player.BOT]: "Bot",
  };

  return {
    firstPlayerName: playerNames[firstPlayer],
    secondPlayerName: playerNames[secondPlayer],
  };
};
