import "./style.css";
import { interval, merge, switchMap, takeUntil,
   ReplaySubject, tap, zip, EMPTY, Observable } from "rxjs";
   
import { scan } from "rxjs/operators";
import { State } from "./types";
import { left$, right$, down$, tick$, up$, game$, space$, 
  replay$, next$, replayButton$, newButton$, hold$} from "./observable";

import { initialState, reduceState } from "./state";
import { render, replayMode } from "./view";


/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  const
    // Game playing merge all event listener together 
    source$ = ():  Observable<State> => 
      merge(tick$, left$, right$, down$, up$, space$, hold$)
      // Map them to state by passing into reducestate
      .pipe(scan(reduceState, initialState())),

    main$ = game$.pipe(switchMap(v =>  { 
      /**
       * game$ (behavioursubject only store one value each time)
       * update through next()
       */

      // game$ get new value switch map 
      // true source$ false nothing
      if(v){
        // ReplaySubject record all state change
        const e = new ReplaySubject<State>()
        replay$.next(e)

        // Pass in true to reset html page
        render(true)(initialState())
        return source$().pipe(tap((event)=> e.next(event)))
      }
      else{
        return EMPTY
      }
    })).subscribe(render(false))

    // If replay button clicked get into replay mode
    replayButton$.forEach(v => {
      render(true)(initialState())
      replayMode?.setAttribute("visibility", "visible");

      // Emit the state stored in replay$ with 80ms emit one
      zip(interval(80),replay$.getValue()).pipe(
        takeUntil(newButton$)).subscribe(([n,e]) => render(false)(e))
    })

    // if next$ button pushed sestart the game
    next$.forEach(v => {
      game$.next(true)
    })

    // In restart mode you able to start new game by pressing button
    newButton$.forEach(v => {
      game$.next(true)
      replayMode?.setAttribute("visibility", "hidden");
    })

    
}

if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
