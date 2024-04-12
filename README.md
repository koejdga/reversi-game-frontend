# Reversi Game with Holes

Welcome to the Reversi Game with Holes repository! </br> </br>
This is one of the projects developed for the Logic Programming subject during the Spring Semester of 2024 at the National University of Kyiv-Mohyla Academy. </br> </br>
This project implements a Reversi (Othello) game with customizable board dimensions and hole positions. 
Users can choose the width and height of the board and specify the positions of holes, or let the computer randomly place holes. 
The game features field validation to prevent situations where too many holes are on the board. 
During the game, possible moves for both the user and the bot are highlighted. 
The game supports various modes, including 2 users, 2 bots, and bot vs. user. 
Additionally, statistics can be saved at the end of each game, showing the duration of requests to the server.

## Overview

The Reversi Game with Holes project provides an engaging gaming experience with customizable board configurations and challenging gameplay. 
Players can enjoy the classic Reversi game with added complexity from holes on the board, leading to strategic decision-making and dynamic gameplay.

## Features

- **Minimax Algorithm**: The bot utilizes the minimax algorithm to determine its moves, making strategic decisions based on potential future outcomes.
- **Highlighted Moves**: During the game, possible moves for both the user and the bot are highlighted, aiding in decision-making.
- **Customizable Board**: Users can choose the width and height of the board and specify hole positions or let the computer randomly place holes.
- **Field Validation**: Prevents situations where too many holes are on the board, ensuring a fair and balanced gameplay experience.
- **Game Modes**: Supports various game modes, including 2 users, 2 bots, and bot vs. user, providing flexibility and entertainment for different preferences.
- **Statistics**: Statistics can be saved at the end of each game, showing the duration of requests to the server, allowing players to track their progress and performance.

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express.js, Tau Prolog
- **Game Logic 1**: Tau Prolog
- **Game Logic 2**: Python

## Setup Instructions

1. Clone the repository to your local machine.
2. Navigate to the `tau-prolog-backend` folder and install dependencies using `npm install`.
3. Start the server by running `node server.js`.
4. Navigate to the `frontend` folder and install dependencies using `npm install`.
5. Start the frontend server by running `npm start`.

## Python vs Prolog Implementation

The project provides both Python and Prolog implementations of the Reversi game with holes. 
While the Python implementation offers flexibility and ease of understanding, the Prolog implementation leverages declarative programming to provide concise and elegant solutions. 
You can compare the two implementations to gain insights into different programming paradigms and their application in game development.
Python implementation is inside `python-backend` folder. Prolog implementation is inside `tau-prolog-backend` folder (all `.pl` files).
