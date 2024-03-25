export const defaultWidth = 8;
export const defaultHeight = 8;
export const cellSize = 40;

export let width = localStorage.getItem("width") || defaultWidth;
export let height = localStorage.getItem("height") || defaultHeight;

export const GameMode = Object.freeze({
  CREATING: 0,
  PLAYING: 1,
});

export const Player = Object.freeze({
  USER: 0,
  BOT: 1,
});
