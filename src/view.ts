// Update the view according to the given State.
// All dependencies on SVG and HTML are isolated to this file.
export { render,replayMode }


import { game$ } from './observable';
import { State, Body, Viewport, BlockConst, HoldConst } from './types';
import { Vec, attr } from './util';

// Canvas elements
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement & HTMLElement;
const hold = document.querySelector("#svgHold") as SVGGraphicsElement & HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement & HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement & HTMLElement;
const container = document.querySelector("#main") as HTMLElement;
const replayMode = document.querySelector("#replayMode") as SVGGraphicsElement & HTMLElement;

// Some attributes setup
svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);
hold.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
hold.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);



// Text fields
const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

highScoreText.innerHTML = "0"

/**
 * Update the SVG game view.  
 * 
 * @param clear if true clear all existed child otherwise render
 * @param s the current game model State
 * @returns void
 */
function render(clear: boolean) {
  return function (s: State): void {
    
    // if getElement is null, exit function early without doing anything
    if (!svg || !preview || !gameover || !container) return

    /**
     * Displays a SVG element on the canvas. Brings to foreground.
     * @param elem SVG element to display
     */
    const show = (elem: SVGGraphicsElement) => {
      elem?.setAttribute("visibility", "visible");
      elem?.parentNode!.appendChild(elem);
    };

    /**
     * hide a SVG element on the canvas. Brings to background.
     * @param elem SVG element to display
     */
    const hide = (elem: SVGGraphicsElement) => {
      elem?.setAttribute("visibility", "hidden");
    };

    /**
    * Creates an SVG element with the given properties.
    *
    * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
    * element names and properties.
    *
    * @param namespace Namespace of the SVG element
    * @param name SVGElement name
    * @param props Properties to set on the SVG element
    * @returns SVG element
    */
    const createSvgElement = (
      namespace: string | null,
      name: string,
      props: Record<string, string> = {}
    ) => {
      const elem = document.createElementNS(namespace, name) as SVGElement;
      Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
      return elem;
    };

    /**
    * Restart the game and clear all the child existed, hide gameover 
    * @returns void
    */
    const restart = (): void => {
      preview.innerHTML = '';
      hold.innerHTML = ''
      svg.innerHTML = '';
      svg.appendChild(gameover);
      hide(gameover);
    }

    
    // If true restart() and return to cut rendering
    if(clear){ 
      restart()
      return 
    }

    /**
    * Render Body on the html webpage
    *
    * @param rootSVG HTMLElement
    * @param b Body to render
    * @returns void
    */
    const renderBodyView = (rootSVG: HTMLElement) => (b: Body): void => {
      // add the cube by id to SVG canvas
      b.cube.map(c => {
        const v = document.getElementById(`${c.id}${b.id}`)
        if (v){
          // If the cube already be there update its attribute
          attr(v,{x: c.apos.x, y: c.apos.y})
        }
        else{
          const cube = createSvgElement(rootSVG.namespaceURI, "rect", {
            id: `${c.id}${b.id}` , //Id group by cubes and block
            height: `${BlockConst.HEIGHT}`,
            width: `${BlockConst.WIDTH}`,
            x: `${c.apos.x}`,
            y: `${c.apos.y}`,
            fill: `${b.color}`
          })
          rootSVG.appendChild(cube)
      }})}
    
    
    renderBodyView(svg)(s.block)
    
    preview.innerHTML = ''
    /**
    * Update the ID and apos of Body and cubes for preview and hold
    *
    * @param b a old Body
    * @param prefix String to avoid conflict
    * @param x, y new pos
    * @returns a new Body
    */
    const previewBlock = (b:Body) => (prefix: string) => 
      (x: number, y:number): Body => ({...b, id: prefix + b.id,
        cube: b.cube.map(c => 
          ({...c, apos: c.apos.add(new Vec(x, y))}))})
    
    // Render preview block
    renderBodyView(preview)(previewBlock(s.nextBlock)("preview")
    (Viewport.PREVIEW_WIDTH/2 - Viewport.CANVAS_WIDTH/2, BlockConst.HEIGHT))
    
    
    hold.innerHTML = ''
    if (s.holdBlock){
      // Set pos to origin
      const newBlock = {...s.holdBlock, cube: HoldConst[s.holdBlock.viewType]}

      // Render the hold block
      renderBodyView(hold)(previewBlock(newBlock)("hold")
      (Viewport.PREVIEW_WIDTH/2 - Viewport.CANVAS_WIDTH/2, BlockConst.HEIGHT))
    }



    // Rendering row elimination
    if (s.cubeToClear.length > 1){
      s.cubeToClear.map(c => {
        const v = document.getElementById(c.id);
        v && svg.removeChild(v) 
      })
    }

    // Update each stopped cubes 
    s.stop.map(c => {
      const v = document.getElementById(c.id)
        if (v) {attr(v,{x: c.apos.x, y: c.apos.y})}
        
        // Preventing bug of some stopped cubes not showing
        else {
          const cube = createSvgElement(svg.namespaceURI, "rect", {
            id: `${c.id}` , //Id group by cubes and block
            height: `${BlockConst.HEIGHT}`,
            width: `${BlockConst.WIDTH}`,
            x: `${c.apos.x}`,
            y: `${c.apos.y}`,
            fill: `${c.color}`
          })
          svg.appendChild(cube)}
    })

    // Update score
    if (!scoreText) return
    scoreText.innerHTML = `${s.score}`

    // Update the level
    if (!levelText) return
    levelText.innerHTML = `${s.level}`

    

    if (s.gameEnd) {
      show(gameover);

      // Game stop reflect to main$ in main.ts
      game$.next(false)

      // Update the highscore
      if (parseInt(highScoreText.innerHTML) < s.score){
        highScoreText.innerHTML = `${s.score}`
      }
    }
  }
}