// Functions and definitions of game state objects and state management.
// The only exports are the `initialState` object and the function `reduceState`.
export { initialState, reduceState }

// Game state is modelled in one main object of type State, which contains collections of the game elements

import { intervalUpdateS$ } from './observable';

import { ViewType, ObjectId, Block, Cube, Body, Constants, State, Rotate, Tick, 
    Move, BlockConst, Viewport, SquareConst, IConst, JConst,  LConst, SConst, 
    TConst, ZConst, HoldConst, Drop, Hold } from "./types"

import { Vec, RNG, blockUpdate, stateUpdate, moveBody, 
    reverseMoveBody, bodiesCollided, cubesUntilTheEnd} from "./util"

// Cubes are collected by a Block, and a Block is a Body store in State

const 
    // General function creating any type of block
    createBlock = (viewType: ViewType) => (block: Block) => (oid: ObjectId): Body => 
    ({
        ...oid,
        ...block,
        dis: new Vec(0,BlockConst.HEIGHT),
        id: viewType + oid.id,
        viewType: viewType
    }),

    // Simulate the Math.choice() function randomly choose a element from an array
    choice =  <T>(lst: ReadonlyArray<T>) => (seed: number) => lst[Math.floor(RNG.scale(RNG.hash(seed))(lst.length))],

    // Building the array form creating all type of Block
    createSquare = createBlock('Square')({ cube: SquareConst.CUBE, width: SquareConst.WIDTH, 
        height: SquareConst.HEIGHT, center: SquareConst.CENTER, color: SquareConst.COLOR}),

    createI = createBlock("I")({ cube: IConst.CUBE, width: IConst.WIDTH, 
        height: IConst.HEIGHT, center: IConst.CENTER, color: IConst.COLOR}),

    createJ = createBlock("J")({ cube: JConst.CUBE, width: JConst.WIDTH, 
        height: JConst.HEIGHT, center: JConst.CENTER, color: JConst.COLOR}),

    createL = createBlock("L")({ cube: LConst.CUBE, width: LConst.WIDTH, 
        height: LConst.HEIGHT, center: LConst.CENTER, color: LConst.COLOR}),

    createS = createBlock("S")({ cube: SConst.CUBE, width: SConst.WIDTH, 
        height: SConst.HEIGHT, center: SConst.CENTER, color: SConst.COLOR}),

    createT = createBlock("T")({ cube: TConst.CUBE, width: TConst.WIDTH, 
        height: TConst.HEIGHT, center: TConst.CENTER, color: TConst.COLOR}),

    createZ = createBlock("Z")({ cube: ZConst.CUBE, width: ZConst.WIDTH, 
        height: ZConst.HEIGHT, center: ZConst.CENTER, color: ZConst.COLOR}),
    
    blockList = [createSquare, createI, createJ, createL, createS, createT, createZ],

    // Randomly generate one type of block
    generateBlock = (oid: ObjectId) => (seed: number): Body => choice(blockList)(seed)(oid)

/////////////// INITIAL STATE ////////////////////
// Used Date.getTime for seed
const
    initialState = (): State => ({
        rowCleared: 0,
        level: 0,
        score: 0,
        // Pull block up one cubes dis, since initial state not rendering
        block: blockUpdate(generateBlock({ id: String(0)})(new Date().getTime()))
            (0,-BlockConst.HEIGHT), 
        nextBlock: generateBlock({id: String(1)})(RNG.hash(new Date().getTime())),
        hold: true, //able to hold
        hardDrop: true, //able to hardDrop
        cubeToClear: [],
        stop: [],
        seed: RNG.hash(RNG.hash((new Date().getTime()))),
        gameEnd: false,
        objCount: 2 // Start from 2 because block and nextBlock occupy 0 and 1
    });

//////////////// STATE UPDATES //////////////////////
 const
////////////////// Rotate //////////////////
/** 
 * handling left wallkick
 * @param s a state
 * @returns the state after wallkick if happen
 */
exceedLeftMove = (s:State): State => s.block.cube.filter(
    c => c.apos.x < 0 ).length > 0
? {...s, block: blockUpdate(s.block)
    (s.block.viewType == "I"? 2*BlockConst.WIDTH: BlockConst.WIDTH, 0)} : s,

/** 
 * handling right wallkick
 * @param s a state
 * @returns the state after wallkick if happen
 */
exceedRightMove = (s:State): State => s.block.cube.filter(c => 
    c.apos.x > Viewport.CANVAS_WIDTH - BlockConst.WIDTH ).length > 0
? {...s, block: blockUpdate(s.block)
    (s.block.viewType == "I"? 2*-BlockConst.WIDTH: -BlockConst.WIDTH, 0)} : s,

/** 
 * calculating coordinates after rotation
 * @param x original x pos
 * @param y original y pos
 * @param dx center x pos
 * @param dy center y pos
 * @returns the state after rotation
 */
// Source: https://codepen.io/desp/pen/qEmbPp?anon=true&view=pen
/** Original looks like: { x: (cos * (x - cx)) - (sin * (y - cy)) + cx,
           y: (sin * (x - cx)) + (cos * (y - cy)) + cy }*/ 
pos_rotated = (x: number, dx: number, y: number, dy: number) => 
new Vec(Math.round(dx -  (y - dy)) - BlockConst.WIDTH, Math.round(dy + (x - dx))),

////////////////// Move //////////////////

/** 
 * Checking block exceed left of canvas
 * @param s a state
 * @returns true for exceed otherwise false
 */
exceedLeft = (s:State): boolean => s.block.cube.filter(
    c => c.apos.x == 0).length > 0,

/** 
 * Checking block exceed right of canvas
 * @param s a state
 * @returns true for exceed otherwise false
 */
exceedRight = (s:State): boolean => s.block.cube.filter(
    c => c.apos.x == Viewport.CANVAS_WIDTH - BlockConst.WIDTH).length > 0,

////////////////// Drop //////////////////

/** 
* bodies move until bottom, cubes move
* @param s old State
* @returns new State
*/
dropDown = (s: State): State =>  {
    // recursive call until collision or until the end return 
    return (bodiesCollided(s)||cubesUntilTheEnd(s))
    ? exceedTop(rowClear(handleVerticalCollisions(s)))
    : dropDown({...s,block: moveBody(s.block)})
},

////////////////// Tick //////////////////
 /** 
* checking the cube is exceed the top of canvas or not
* @param s the state created square
* @returns the state which gameover or not
*/
 exceedTop = (s: State): State => {
    const
        //If collied when block spawned move up one cube dis
        firstBodiesCollided = bodiesCollided(s),

        newState = firstBodiesCollided 
        ? stateUpdate(s)(0,-BlockConst.HEIGHT): s,

        //If still collied move up one cube dis again
        secondBodiesCollided = bodiesCollided(newState),

        finalNewState = secondBodiesCollided 
        ? stateUpdate(newState)(0,-BlockConst.HEIGHT): newState 

        //Check exceed top or not if so return gameend true
        return (finalNewState.block.cube.filter(c => c.apos.y < 0).length > 0) 
        ? {...finalNewState, gameEnd: true} : finalNewState
},

/** 
* check a State for collisions:
* block will stop after collision
* @param s Game State
* @returns a new State
*/
handleVerticalCollisions = (s: State): State => {
    // if collided spawn a new block on the top of canvas
    return cubesUntilTheEnd(s) || bodiesCollided(s) ? {
        ...s,
        block: {...s.nextBlock},
        nextBlock: generateBlock({id: String(s.objCount)})(s.seed),
        seed: RNG.hash(s.seed),
        hold: true, // able to hold
        stop: [...s.stop, ...reverseMoveBody(s.block).cube.map(
            c => ({...c, id: c.id + s.block.id, color: s.block.color}))],
        objCount: s.objCount + 1
    } : s 
},

/** 
* check a State for full row of blocks:
* clear the row
* @param s Game State
* @returns a new State
*/
rowClear = (s: State): State => {
    const
        //filter out particular row by y pos
        rowIndex = (n: number): Cube[] => s.stop.filter(
            c => c.apos.y == n*Constants.GRID_HEIGHT),

        //create an array with all row and than filter out which full
        clear = Array(Constants.GRID_HEIGHT).fill(0).
            map((_, i) => rowIndex(i)).
            filter(r => r.length>=Constants.GRID_WIDTH),
        
        // filter the original stopped cubes by row eliminated
        newStop = s.stop.filter(c => !clear.flat().includes(c)),

        // Update each cubes which drop down due to row elimination
        final = clear.reduce<Cube[]>((a,v) => a.map(c => c.apos.y < v[0].apos.y
            ? {...c,apos: c.apos.add(s.block.dis)}
            : c ), newStop),
        
        // The number of row cleared used for level up
        newRowCleared = s.rowCleared + clear.length ,

        newState = {
            ...s, 
            stop: final, 
            score: s.score + Constants.SCORE[clear.length]*(s.level + 1), 
            cubeToClear: clear.flat()
        }
    
    // If cleared 10 rows level up 1
    return (newRowCleared >= 10)
    ?{...newState, level : s.level + 1, rowCleared: newRowCleared - 10} 
    : {...newState, rowCleared: newRowCleared,}
    
},
    
/** 
* interval tick: bodies move, cubes move
* @param s old State
* @returns new State
*/
tick = (s: State): State =>  {
    // If level up update the interval speed (block moving speed)
    intervalUpdateS$.next(Math.max(Constants.TICK_RATE_MS - (s.level + 1)*40, 30))

    const newS =  exceedTop(rowClear(handleVerticalCollisions({
        ...s,
        block: moveBody(s.block),
        hardDrop: true
    })))

    return newS}
,
    
////////////////////////////// State Update //////////////////////////////
    /**
     * state transducer
     * @param s input State
     * @param action type of action to apply to the State
     * @returns a new State 
     */
    reduceState = (s: State, action: Move | Rotate | Tick | Hold) => {
         if (action instanceof Rotate) {
            const 
                //Calculate coordinates rotated and check wall kick
                newState = exceedLeftMove(exceedRightMove({...s, block: 
                    { ...s.block,
                        cube: s.block.cube.map(c => ({...c, apos: pos_rotated(
                            c.apos.x, s.block.center.x, c.apos.y, s.block.center.y)})
                        )
                    }
                }))
                
            //Avoid collision after rotated
            return !bodiesCollided(newState)
            ?newState: s;

        } else if (action instanceof Move) {
            const 
                //Checking moving left or right and exceed or not
                xDis = action.orientation === "left" 
                    ? exceedLeft(s) ? 0 : - BlockConst.WIDTH
                    : exceedRight(s)? 0 : BlockConst.WIDTH,
                //State update move cubes based on input(right or left)
                newState = stateUpdate(s)(xDis,0)
            return !bodiesCollided(newState)? newState: s;

        } else if (action instanceof Hold){
            // Avoid keep switching hold block
            if (!s.hold){
                return s
            }
            const newState = s.holdBlock 
            //Exchange current block and hold block
            ? {
                ...s,
                block: {...s.holdBlock, cube: HoldConst[s.holdBlock.viewType]},
                holdBlock: {...s.block},
                hold: false,
                cubeToClear: [...s.block.cube.map(c => (
                    {...c, id: `${c.id}${s.block.id}`}))]
            } 
            // Bring current block into hold block since holdBlock is empty
            : {
                ...s,
                holdBlock: {...s.block},
                block: {...s.nextBlock},
                hold: false,
                cubeToClear: [...s.block.cube.map(c => (
                    {...c, id: `${c.id}${s.block.id}`}))],     
                nextBlock: generateBlock({id: String(s.objCount)})(s.seed),
                seed: RNG.hash(s.seed),
                objCount: s.objCount + 1
            }
            return newState

        }else if (action instanceof Drop){
            // HardDrop false make unable to keep harddropping
            // For user experience not keep harddroping
            return s.hardDrop ? {...dropDown(s), hardDrop: false}: s

        } else (action instanceof Tick)
            return tick(s);
    }
