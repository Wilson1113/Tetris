// Common Tetris type definitions
export {Viewport, Constants, BlockConst, SquareConst, IConst, JConst, 
  LConst, SConst, ZConst, TConst, HoldConst, Tick, Rotate, Move, Drop, Hold}

export type { Block, Cube, ObjectId, Body, State, ViewType, Key, Event, 
  Orientation }

import { Vec } from "./util";

/** Constants */
const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 80,

} as const;

const Constants = {
  TICK_RATE_MS: 500,
  ROTATE_ANGLE: 90,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
  SCORE: [
    0,
    100,
    300,
    500,
    800
  ],
  
} as const;

/** Constants for all type of block*/
const BlockConst = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
} as const;

/** Cube constants of each type of block*/
const HoldConst = {
  "Square": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH, BlockConst.HEIGHT)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH, 0)},

    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2, BlockConst.HEIGHT)},

    {id: "4", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2, 0)}
  ],
  "I": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, BlockConst.HEIGHT)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2, BlockConst.HEIGHT)},
      
    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH, BlockConst.HEIGHT)},
    {id: "4", 
      apos: new Vec(Viewport.PREVIEW_WIDTH/2 + 2*BlockConst.WIDTH, BlockConst.HEIGHT)}
  ],
  "J": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, 0)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, BlockConst.HEIGHT)},

    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , BlockConst.HEIGHT)},

    {id: "4", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH , BlockConst.HEIGHT)}
  ],
  "L": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH, 0)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, BlockConst.HEIGHT)},

    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , BlockConst.HEIGHT)},

    {id: "4", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH , BlockConst.HEIGHT)}
  ],
  "S": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH, 0)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, BlockConst.HEIGHT)},

    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , BlockConst.HEIGHT)},

    {id: "4", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , 0)}
  ],
  "T": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , 0)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, BlockConst.HEIGHT)},

    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , BlockConst.HEIGHT)},

    {id: "4", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH , BlockConst.HEIGHT)}
  ],
  "Z": [
    {id: "1", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , 0)},

    {id: "2", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 - BlockConst.WIDTH, 0)},

    {id: "3", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 , BlockConst.HEIGHT)},

    {id: "4", apos: 
      new Vec(Viewport.PREVIEW_WIDTH/2 + BlockConst.WIDTH , BlockConst.HEIGHT)}
  ]

} as const

/** Constants of each type of block*/
const SquareConst = {
  CENTER: new Vec(Viewport.CANVAS_WIDTH/2, BlockConst.HEIGHT),
  WIDTH: 2*BlockConst.WIDTH,
  HEIGHT: 2*BlockConst.HEIGHT,
  COLOR: "yellow",
  CUBE: HoldConst["Square"]
} as const;

const IConst = {
  CENTER: new Vec(Viewport.CANVAS_WIDTH/2, 2*BlockConst.HEIGHT),
  WIDTH: 4*BlockConst.WIDTH,
  HEIGHT: 4*BlockConst.HEIGHT,
  COLOR: "aqua",
  CUBE: HoldConst["I"]
} as const;

const JConst = {
  CENTER: new Vec(Viewport.CANVAS_WIDTH/2 - BlockConst.WIDTH/2, 1.5*BlockConst.HEIGHT),
  START_POS: new Vec(Viewport.CANVAS_WIDTH/2 - 2*BlockConst.WIDTH,0),
  WIDTH: 3*BlockConst.WIDTH,
  HEIGHT: 3*BlockConst.HEIGHT,
  COLOR: "blue",
  CUBE: HoldConst["J"]
    
} as const;

const LConst = {
  CENTER: 
  new Vec(Viewport.CANVAS_WIDTH/2 - BlockConst.WIDTH/2, 1.5*BlockConst.HEIGHT),
  WIDTH: 3*BlockConst.WIDTH,
  HEIGHT: 3*BlockConst.HEIGHT,
  COLOR: "orange",
  CUBE: HoldConst["L"]
} as const;

const SConst = {
  CENTER: 
  new Vec(Viewport.CANVAS_WIDTH/2 - BlockConst.WIDTH/2, 1.5*BlockConst.HEIGHT),
  WIDTH: 3*BlockConst.WIDTH,
  HEIGHT: 3*BlockConst.HEIGHT,
  COLOR: "green",
  CUBE: HoldConst["S"]
} as const;

const TConst = {
  CENTER: 
  new Vec(Viewport.CANVAS_WIDTH/2 - BlockConst.WIDTH/2, 1.5*BlockConst.HEIGHT),
  WIDTH: 3*BlockConst.WIDTH,
  HEIGHT: 3*BlockConst.HEIGHT,
  COLOR: "purple",
  CUBE: HoldConst["T"]
} as const;

const ZConst = {
  CENTER: 
  new Vec(Viewport.CANVAS_WIDTH/2 - BlockConst.WIDTH/2, 1.5*BlockConst.HEIGHT),
  WIDTH: 3*BlockConst.WIDTH,
  HEIGHT: 3*BlockConst.HEIGHT,
  COLOR: "red",
  CUBE: HoldConst["Z"]
} as const;



/** User input */

/**
 * a string literal type for each key used in game control
 */
type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyC" | "Space";

/**
 * only input events are keydown, keyup and keypress
 */
type Event = "keydown" | "keyup" | "keypress";

/**
 * only moving left or right
 */
type Orientation = "left" | "right";

/**
 * our game has the following view element types
 */
type ViewType = "Square" | "I" | "J" | "L" | "S" | "T" | "Z"

// Five Action types that trigger game state transitions
class Move{ constructor(public readonly orientation: Orientation) {} }
class Tick { constructor() {} }
class Rotate { constructor() {} }
class Drop { constructor() {}}
class Hold { constructor() {}}

/**
 * Basic object render physically
 */
// color in cubes is for preventing bug
type Cube = Readonly<{ id: string, apos: Vec, color?: string}>

/**
 * Block will be abstract layer containing cubes which not render physically 
 */
type Block = Readonly<{ cube: ReadonlyArray<Cube>, width: number, 
  height: number, center: Vec, color: string, special?: string}>

/**
 * ObjectIds help us identify objects and manage objects 
 */
type ObjectId = Readonly<{ id: string }>

interface IBody extends Block, ObjectId {
  viewType: ViewType,
  dis: Vec,
}

// Every object that participates in physics is or under Body
type Body = Readonly<IBody>

/** State processing */
type State = Readonly<{
  rowCleared: number // number of row cleared,
  level: number,
  score: number,
  block: Body // the block currenly moving ,
  hold: boolean // able to hold or not,
  hardDrop: boolean // able to harddrop or not,
  holdBlock?: Body // the block hold,
  cubeToClear: ReadonlyArray<Cube> // the cube to clear in row elimination,
  nextBlock: Body // next block to move for previewing,
  stop: ReadonlyArray<Cube> // block collided become cubes store together, 
  objCount: number // used for id,
  seed: number // used for RNG,
  gameEnd: boolean // tracking game ending
}>

