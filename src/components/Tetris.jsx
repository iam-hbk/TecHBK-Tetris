"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

const TETROMINOS = {
  0: { shape: [[0]], color: "209, 213, 219" },
  I: {
    shape: [
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
    ],
    color: "59, 130, 246",
  },
  J: {
    shape: [
      [0, "J", 0],
      [0, "J", 0],
      ["J", "J", 0],
    ],
    color: "99, 102, 241",
  },
  L: {
    shape: [
      [0, "L", 0],
      [0, "L", 0],
      [0, "L", "L"],
    ],
    color: "245, 158, 11",
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    color: "252, 211, 77",
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
      [0, 0, 0],
    ],
    color: "16, 185, 129",
  },
  T: {
    shape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    color: "236, 72, 153",
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
      [0, 0, 0],
    ],
    color: "239, 68, 68",
  },
};

const STAGE_WIDTH = 12;
const STAGE_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;
const MINIMUM_DROP_TIME = 100;
const POINTS_PER_ROW = 10;
const SPEED_INCREASE_FACTOR = 0.995; // Slightly decrease drop time for each point

const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () => Array(STAGE_WIDTH).fill([0, "clear"]));

const randomTetromino = () => {
  const tetrominos = "IJLOSTZ";
  const randTetromino =
    tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

const calculateDropTime = (score) => {
  return Math.max(
    INITIAL_DROP_TIME * Math.pow(SPEED_INCREASE_FACTOR, score),
    MINIMUM_DROP_TIME
  );
};

const TetrominoPreview = ({ tetromino, title }) => {
  const tetrominoStage = Array.from(Array(4), () =>
    Array(4).fill([0, "clear"])
  );

  if (tetromino && tetromino.shape) {
    tetromino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          tetrominoStage[y][x] = [cell, "clear"];
        }
      });
    });
  }

  return (
    <div className="border-2 border-gray-700 bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-2 text-gray-200">{title}</h2>
      <div className="grid grid-cols-4 gap-[1px]">
        {tetrominoStage.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="w-6 h-6 border border-gray-700 rounded-sm transition-all duration-150 ease-in-out"
              style={{
                background:
                  cell[0] === 0
                    ? "rgba(26, 32, 44, 0.8)"
                    : `rgba(${TETROMINOS[cell[0]].color}, 0.8)`,
                boxShadow:
                  cell[0] !== 0
                    ? "inset 0 0 5px rgba(255,255,255,0.5)"
                    : "none",
                transform: cell[0] !== 0 ? "scale(1.02)" : "scale(1)",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default function Tetris() {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(createStage());
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });
  const [nextTetromino, setNextTetromino] = useState(randomTetromino());
  const [heldTetromino, setHeldTetromino] = useState(null);
  const [canHold, setCanHold] = useState(true);

  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const startGame = () => {
    setStage(createStage());
    setDropTime(INITIAL_DROP_TIME);
    resetPlayer();
    setScore(0);
    setGameOver(false);
    setNextTetromino(randomTetromino());
    setHeldTetromino(null);
    setCanHold(true);
  };

  const drop = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const dropPlayer = () => {
    drop();
  };

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        dropPlayer();
      } else if (keyCode === 38) {
        playerRotate(stage, 1);
      } else if (keyCode === 67) {
        holdTetromino();
      }
    }
  };

  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: nextTetromino.shape,
      collided: false,
    });
    setNextTetromino(randomTetromino());
    setCanHold(true);
  }, [nextTetromino]);

  const holdTetromino = () => {
    if (!canHold || gameOver) return;

    const currentTetrominoType = player.tetromino[0].find((cell) => cell !== 0);
    if (!currentTetrominoType) return; // Invalid tetromino, don't proceed

    const currentTetromino = TETROMINOS[currentTetrominoType];
    let nextShape;

    if (heldTetromino) {
      nextShape = heldTetromino.shape;
      setHeldTetromino(currentTetromino);
    } else {
      nextShape = nextTetromino.shape;
      setHeldTetromino(currentTetromino);
      setNextTetromino(randomTetromino());
    }

    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: nextShape,
      collided: false,
    });

    setCanHold(false);
  };

  const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
      for (let x = 0; x < player.tetromino[y].length; x += 1) {
        if (player.tetromino[y][x] !== 0) {
          if (
            !stage[y + player.pos.y + moveY] ||
            !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
            stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !==
              "clear"
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const playerRotate = (stage, dir) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  const rotate = (matrix, dir) => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    if (dir > 0) return rotatedTetro.map((row) => row.reverse());
    return rotatedTetro.reverse();
  };

  const sweepRows = (newStage) => {
    let rowsCleared = 0;
    const sweepedStage = newStage.reduce((ack, row) => {
      if (row.findIndex((cell) => cell[0] === 0) === -1) {
        rowsCleared += 1;
        ack.unshift(new Array(newStage[0].length).fill([0, "clear"]));
        return ack;
      }
      ack.push(row);
      return ack;
    }, []);

    if (rowsCleared > 0) {
      setScore((prev) => {
        const newScore = prev + rowsCleared * POINTS_PER_ROW;
        setDropTime(calculateDropTime(newScore));
        return newScore;
      });
    }

    return sweepedStage;
  };

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        drop();
      }, dropTime);
      return () => {
        clearInterval(interval);
      };
    }
  }, [drop, dropTime, gameOver]);

  useEffect(() => {
    const updateStage = (prevStage) => {
      const newStage = prevStage.map((row) =>
        row.map((cell) => (cell[1] === "clear" ? [0, "clear"] : cell))
      );

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [
              value,
              `${player.collided ? "merged" : "clear"}`,
            ];
          }
        });
      });

      if (player.collided) {
        resetPlayer();
        return sweepRows(newStage);
      }

      return newStage;
    };

    setStage((prev) => updateStage(prev));
  }, [player, resetPlayer]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-700"
      onKeyDown={move}
      tabIndex="0"
    >
      <h1 className="text-5xl font-bold mb-8 text-gray-100 animate-pulse">
        Tetris
      </h1>
      <div className="flex items-start space-x-4">
        <TetrominoPreview tetromino={heldTetromino} title="Hold" />
        <div className="border-4 border-gray-600 bg-gray-800 p-1 rounded-lg shadow-2xl">
          {stage.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={x}
                  className="w-6 h-6 border border-gray-700 rounded-sm transition-all duration-150 ease-in-out"
                  style={{
                    background:
                      cell[0] === 0
                        ? "rgba(26, 32, 44, 0.8)"
                        : `rgba(${TETROMINOS[cell[0]].color}, 0.8)`,
                    boxShadow:
                      cell[0] !== 0
                        ? "inset 0 0 5px rgba(255,255,255,0.5)"
                        : "none",
                    transform: cell[0] !== 0 ? "scale(1.02)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <TetrominoPreview tetromino={nextTetromino} title="Next" />
      </div>
      {gameOver ? (
        <div className="mt-8 text-2xl font-semibold text-red-500 animate-bounce">
          Game Over
        </div>
      ) : null}
      <div className="mt-6 text-2xl font-semibold text-gray-200">
        Score: {score}
      </div>
      <Button
        className="mt-6 px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={startGame}
      >
        {gameOver ? "Restart Game" : "Start Game"}
      </Button>
      <div className="mt-6 text-sm text-gray-400 max-w-md text-center">
        Use arrow keys to move and rotate. Down arrow to drop faster. Press 'C'
        to hold/swap Tetromino.
      </div>
    </div>
  );
}
