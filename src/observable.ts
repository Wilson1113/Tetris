export { left$, right$, down$, tick$, up$, intervalUpdateS$, 
  game$, space$, replay$, next$, replayButton$, newButton$, hold$}

import "./style.css";

import { fromEvent, interval, merge, switchMap, 
  BehaviorSubject, EMPTY, ReplaySubject } from "rxjs";
import { map, filter} from "rxjs/operators";
import { Key, State, Tick, Move, Rotate, Drop, Hold} from "./types";

/** User input */
const nextButton = document.getElementById("nextGame")
const replayButton = document.getElementById("replay")
const newButton = document.getElementById("newGame")

const key$ = fromEvent<KeyboardEvent>(document, "keypress");

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

/** Keyboard Event */
const left$ = fromKey("KeyA").pipe(map(_ => new Move("left")));
const right$ = fromKey("KeyD").pipe(map(_ => new Move("right")));
const down$ = fromKey("KeyS").pipe(map(_ => new Tick()));
const up$ = fromKey("KeyW").pipe(map(_ => new Rotate()));
const hold$ = fromKey("KeyC").pipe(map(_ => new Hold()));
const space$ = fromKey("Space").pipe(map(_ => new Drop()));

/** Button clicking event */
const next$ = nextButton
  ?fromEvent<MouseEvent>(nextButton, "click"): EMPTY;
const replayButton$ = replayButton
  ?fromEvent<MouseEvent>(replayButton, "click"): EMPTY;
const newButton$ = newButton
  ?fromEvent<MouseEvent>(newButton, "click"): EMPTY;

/** Determines the rate of time steps */
// Each time intervalUpdateS$.next() switchMap to new interval (Speed of Tick)
const intervalUpdateS$ = new BehaviorSubject(500)
const tick$ = intervalUpdateS$.pipe(
  switchMap(val => interval(val)),map(_ => new Tick()));

/** Determine the gameover, gamestart*/
const game$ = new BehaviorSubject(true)

/** Storing the game replay for each game*/
// Each time next() represent new game start
const replay$ = new BehaviorSubject(new ReplaySubject<State>())





