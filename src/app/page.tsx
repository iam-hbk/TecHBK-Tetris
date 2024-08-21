"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Move } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TetrominoType = "0" | "I" | "J" | "L" | "O" | "S" | "T" | "Z";
type TetrominoShape = (TetrominoType | 0)[][];
type TetrominoColor = string;

interface Tetromino {
  shape: TetrominoShape;
  color: TetrominoColor;
}

type Stage = [TetrominoType | 0, string][][];

interface Player {
  pos: { x: number; y: number };
  tetromino: TetrominoShape;
  collided: boolean;
}

const TETROMINOS: Record<TetrominoType, Tetromino> = {
  "0": { shape: [[0]], color: "209, 213, 219" },
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
const SPEED_INCREASE_FACTOR = 0.995;

const createStage = (): Stage =>
  Array.from(Array(STAGE_HEIGHT), () => Array(STAGE_WIDTH).fill([0, "clear"]));

const randomTetromino = (): Tetromino => {
  const tetrominos: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"];
  const randTetromino =
    tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

const calculateDropTime = (score: number): number => {
  return Math.max(
    INITIAL_DROP_TIME * Math.pow(SPEED_INCREASE_FACTOR, score),
    MINIMUM_DROP_TIME
  );
};

interface TetrominoPreviewProps {
  tetromino: Tetromino | null;
  title: string;
  className?: string;
}

const TetrominoPreview: React.FC<TetrominoPreviewProps> = ({
  tetromino,
  title,
  className,
}) => {
  const tetrominoStage: Stage = Array.from(Array(4), () =>
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
    <div
      className={cn(
        "border-2 border-gray-700 bg-gray-800 p-2 md:p-4 rounded-lg shadow-lg",
        className
      )}
    >
      <h2 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-gray-200">
        {title}
      </h2>
      <div className="grid grid-cols-4 gap-[1px]">
        {tetrominoStage.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="w-4 h-4 md:w-6 md:h-6 border border-gray-700 rounded-sm transition-all duration-150 ease-in-out"
              style={{
                background:
                  cell[0] === 0
                    ? "rgba(26, 32, 44, 0.8)"
                    : `rgba(${
                        TETROMINOS[cell[0] as TetrominoType].color
                      }, 0.8)`,
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

export default function Component() {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState<Stage>(createStage());
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS["0"].shape,
    collided: false,
  });
  const [nextTetromino, setNextTetromino] = useState<Tetromino>(
    randomTetromino()
  );
  const [heldTetromino, setHeldTetromino] = useState<Tetromino | null>(null);
  const [canHold, setCanHold] = useState(true);

  const movePlayer = (dir: number) => {
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

  const move = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!gameOver) {
        if (e.key === "ArrowLeft") {
          movePlayer(-1);
        } else if (e.key === "ArrowRight") {
          movePlayer(1);
        } else if (e.key === "ArrowDown") {
          dropPlayer();
        } else if (e.key === "ArrowUp") {
          playerRotate(stage, 1);
        } else if (e.key === "c" || e.key === "C") {
          holdTetromino();
        }
      }
    },
    [gameOver, stage]
  );

  const updatePlayerPos = ({
    x,
    y,
    collided,
  }: {
    x: number;
    y: number;
    collided?: boolean;
  }) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided: collided ?? prev.collided,
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

    const currentTetrominoType = player.tetromino[0].find(
      (cell) => cell !== 0
    ) as TetrominoType;
    if (!currentTetrominoType) return;

    const currentTetromino = TETROMINOS[currentTetrominoType];
    let nextShape: TetrominoShape;

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

  const checkCollision = (
    player: Player,
    stage: Stage,
    { x: moveX, y: moveY }: { x: number; y: number }
  ): boolean => {
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

  const playerRotate = (stage: Stage, dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player)) as Player;
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

  const rotate = (matrix: TetrominoShape, dir: number): TetrominoShape => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    if (dir > 0) return rotatedTetro.map((row) => row.reverse());
    return rotatedTetro.reverse();
  };

  const sweepRows = (newStage: Stage): Stage => {
    let rowsCleared = 0;
    const sweepedStage = newStage.reduce((ack, row) => {
      if (row.findIndex((cell) => cell[0] === 0) === -1) {
        rowsCleared += 1;
        ack.unshift(new Array(newStage[0].length).fill([0, "clear"]));
        return ack;
      }
      ack.push(row);
      return ack;
    }, [] as Stage);

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
      }, dropTime ?? INITIAL_DROP_TIME);
      return () => {
        clearInterval(interval);
      };
    }
  }, [drop, dropTime, gameOver]);

  useEffect(() => {
    const updateStage = (prevStage: Stage): Stage => {
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
        return sweepRows(newStage as Stage);
      }

      return newStage as Stage;
    };

    setStage((prev) => updateStage(prev));
  }, [player, resetPlayer]);

  // Touch controls
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal swipe
          if (diffX > 0) {
            movePlayer(1);
          } else {
            movePlayer(-1);
          }
        } else {
          // Vertical swipe
          if (diffY > 0) {
            dropPlayer();
          } else {
            playerRotate(stage, 1);
          }
        }
      };

      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [movePlayer, dropPlayer, playerRotate, stage]
  );

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen  p-4"
      onKeyDown={move}
      onTouchStart={handleTouchStart}
      tabIndex={0}
    >
      
      <div className="mt-4 md:mt-6 text-xs md:text-sm  max-w-md text-center bg-white p-2 rounded-lg mb-6">
        Use{" "}
        <Badge variant={"secondary"} className="py-1">
          <Move className="mr-2 h-4 w-4 inline-block" /> Arrow keys{" "}
        </Badge>{" "}
        to move and rotate.{" "}
        <Badge variant={"secondary"} className="py-1">
          <ArrowDown className="mr-2 h-4 w-4 inline-block" /> Down arrow{" "}
        </Badge>{" "}
        to drop faster. Press <b>'C'</b> to hold/swap Tetromino. On mobile,
        swipe left/right to move, down to drop, and up to rotate.
      </div>
      <div className="hidden sm:flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-row w-full gap-2 items-center justify-around md:hidden">
          <TetrominoPreview tetromino={heldTetromino} title="Hold" />
          <TetrominoPreview tetromino={nextTetromino} title="Next" />
        </div>

        <TetrominoPreview
          tetromino={heldTetromino}
          title="Hold"
          className="hidden md:block"
        />
        <div className="border-4 border-gray-600 bg-gray-800 p-1 rounded-lg shadow-2xl">
          {stage.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={x}
                  className="w-5 h-5 md:w-6 md:h-6 border border-gray-700 rounded-sm transition-all duration-150 ease-in-out"
                  style={{
                    background:
                      cell[0] === 0
                        ? "rgba(26, 32, 44, 0.8)"
                        : `rgba(${
                            TETROMINOS[cell[0] as TetrominoType].color
                          }, 0.8)`,
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
        <TetrominoPreview
          tetromino={nextTetromino}
          title="Next"
          className="hidden md:block"
        />
      </div>
      {gameOver ? (
        <div className="mt-4 md:mt-8 text-xl md:text-2xl font-semibold text-red-500 animate-bounce">
          Game Over
        </div>
      ) : null}
      <div className="mt-4 md:mt-6 text-xl md:text-2xl font-semibold text-gray-200">
        Score: {score}
      </div>
      <Button onClick={startGame}>
        {gameOver ? "Restart Game" : "Start Game"}
      </Button>
    </div>
  );
}
