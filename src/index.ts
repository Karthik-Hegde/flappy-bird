import {
  combineLatest,
  fromEvent,
  interval,
  merge,
  scan,
  takeWhile,
  tap,
} from "rxjs";

import { paint } from "./html-renderer";
import { Pipes } from "./interface";

const gamePipe = (x: number, y: number) => ({ x, y, checked: false });
const gameSize = 10;
const createPipes = (y: number): Pipes[] =>
  ((random) =>
    Array.from(Array(gameSize).keys())
      .map((e) => gamePipe(e, y))
      .filter((e) => e.x < random || e.x > random + 2))(
    Math.floor(Math.random() * Math.floor(gameSize))
  );

const gamePipes$ = interval(500).pipe(
  scan<Pipes[][] | number, Pipes[][]>(
    (acc) =>
      (acc.length < 2 ? [...acc, createPipes(gameSize)] : acc)
        .filter((c) => c.some((e) => e.y > 0))
        .map((cols) => cols.map((e) => gamePipe(e.x, e.y - 1))),
    [createPipes(gameSize / 2), createPipes(gameSize)]
  )
);

const fly = (xPos: number) => (xPos > 0 ? (xPos -= 1) : xPos);
const fall = (xPos: number) =>
  xPos < gameSize - 1 ? (xPos += 1) : gameSize - 1;

const bird$ = merge(interval(300), fromEvent(document, "keydown")).pipe(
  scan<Event | number, number>((xPos, curr) => {
    return curr instanceof KeyboardEvent ? fly(xPos) : fall(xPos);
  }, gameSize - 1)
);

const valueOnCollisionFor = (pipes: Pipes[][]) => ({
  when: (predicate: boolean) =>
    !pipes[0][0].checked && predicate ? ((pipes[0][0].checked = true), 1) : 0,
});

const updateGame = (bird: number, pipes: Pipes[][]): number[][] =>
  ((game) => (
    pipes.forEach((col) => col.forEach((v) => (game[v.x][v.y] = 2))),
    (game[bird][0] = 1),
    game
  ))(
    Array(gameSize)
      .fill(0)
      .map((e) => Array(gameSize).fill(0))
  );

combineLatest(bird$, gamePipes$)
  .pipe(
    scan<[number, Pipes[][]], any>(
      (state, [bird, pipes]) => ({
        bird: bird,
        pipes: pipes,
        lives:
          state.lives -
          valueOnCollisionFor(pipes).when(
            pipes.some((c) => c.some((c) => c.y === 0 && c.x === bird))
          ),
        score:
          state.score + valueOnCollisionFor(pipes).when(pipes[0][0].y === 0),
      }),
      { lives: 3, score: 0, bird: 0, pipes: [] }
    ),
    tap((state) =>
      paint(updateGame(state.bird, state.pipes), state.lives, state.score)
    ),
    takeWhile((state) => state.lives > 0)
  )
  .subscribe();
