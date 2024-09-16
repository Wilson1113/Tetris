/** Utility functions */
export { Vec, attr, blockUpdate, stateUpdate, moveBody, 
    reverseMoveBody, bodiesCollided, cubesUntilTheEnd,  RNG }

import { Block, Cube, Body, State, BlockConst, Viewport } from "./types"

// 
/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
//Source: fit2102, workshop 4, Random number generator but change scale
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed 
     * @returns a hash of the seed
     */
    public static hash = (seed: number): number => (RNG.a * seed + RNG.c) % RNG.m;

    /**
     * Takes hash value and scales it 
     * @param hash 
     * @param len 
     * @returns a scaled hash number
     */
    public static scale = (hash: number) => (len: number): number => 
        ((len * hash) / (RNG.m - 1)) % len;

}

/**
 * A simple immutable vector class
 */
//Source: fit2102, workshop 4
class Vec {
    constructor(public readonly x: number = 0, public readonly y: number = 0) { }
    add = (b: Vec) => new Vec(this.x + b.x, this.y + b.y)
    sub = (b: Vec) => this.add(b.scale(-1))
    len = () => Math.sqrt(this.x * this.x + this.y * this.y)
    scale = (s: number) => new Vec(this.x * s, this.y * s)
    ortho = () => new Vec(this.y, -this.x)
    rotate = (deg: number) =>
        (rad => (
            (cos, sin, { x, y }) => new Vec(x * cos - y * sin, x * sin + y * cos)
        )(Math.cos(rad), Math.sin(rad), this)
        )(Math.PI * deg / 180)

    static unitVecInDirection = (deg: number) => new Vec(0, -1).rotate(deg)
    static Zero = new Vec();
}


const
    /**
     * set a number of attributes on an Element at once
     * @param e the Element
     * @param o a property bag
     */
    //Source: fit2102, workshop 4
    attr = (e: Element, o: { [p: string]: unknown }) => 
        { for (const k in o) e.setAttribute(k, String(o[k])) },
    
    
    /**
     * Update the cubes inside Body (Block)
     * @param b a body which represent a block
     * @param x,y number for update cubes pos
     * @returns new Body
     */
    blockUpdate = (b: Body) => (x: number,y: number): Body => {
        const dis = new Vec(x,y)
        return ({...b, center: b.center.add(dis),
        cube: b.cube.map(c =>
           ({...c, apos: c.apos.add(dis)}))})
        },
    
    /**
     * Update the moving cubes store in Block inside State
     * @param s old state
     * @param x,y number for update cubes pos
     * @returns new State
     */
    stateUpdate = (s: State) => (x: number,y: number): State => {
        const dis = new Vec(x,y)
        return ({...s, 
        block: {...s.block, center: s.block.center.add(dis),
        cube: s.block.cube.map(c =>
           ({...c, apos: c.apos.add(dis)}))}})
        },

    /** 
     * auto downward movement comes through this function
     * @param b a Body to move
     * @returns the moved Body
     */
    moveBody = (b: Body): Body => blockUpdate(b)(0,BlockConst.HEIGHT),

    /** 
     * reverse the move 
     * @param b the moved Body
     * @returns the body before moved
     */
    reverseMoveBody = (b: Body): Body => blockUpdate(b)(0,- BlockConst.HEIGHT),
    
    /**
     * Check two cubes collied or not
     * @param a,b cube which physicall rendered on screen
     * @returns true if collided otherwise false
     */
    cubesCollided = ([a, b]: [Cube, Cube]): Boolean => 
        a.apos.x == b.apos.x && a.apos.y == b.apos.y,
    
    /**
     * Check cubes in block and another cube collied or not
     * @param a block which storing cubes
     * @param b cube which physicall rendered on screen
     * @returns true if collided otherwise false
     */
    blocksCollided = ([a, b]: [Body, Cube]): Boolean => 
        a.cube.map<[Cube,Cube]>(c1 => ([c1,b])).filter(cubesCollided).length > 0,
    
    /**
     * Check cubes in block and current all stopped cubes collied or not
     * @param s a state
     * @returns true if collision happened otherwise false
     */
    //If collision happend then cubes filter out will at least have one
    bodiesCollided = (s: State): boolean => s.stop.filter(b => 
        blocksCollided([s.block, b])).length > 0,

    /**
     * Check block until the end or not
     * @param s a state
     * @returns true if touch the bottom of canvas otherwise false
     */
    cubesUntilTheEnd = (s: State): boolean => s.block.cube.filter(
        c => c.apos.y == Viewport.CANVAS_HEIGHT).length > 0


