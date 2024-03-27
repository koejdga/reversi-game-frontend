export const defaultWidth = 4;
export const defaultHeight = 4; // TODO: change to 8
export const cellSize = 40;

export let width = localStorage.getItem("width") || defaultWidth;
export let height = localStorage.getItem("height") || defaultHeight;

export const GameMode = Object.freeze({
  CREATING: 0,
  PLAYING: 1,
  ENDED: 2,
});

export const Player = Object.freeze({
  USER: 0,
  BOT: 1,
});

export const Winner = Object.freeze({
  BLACK: "black",
  WHITE: "white",
  TIE: "tie",
});

export const WinnerForApi = Object.freeze({
  THIS: "this",
  NOT_THIS: "not_this",
  TIE: "tie",
});
