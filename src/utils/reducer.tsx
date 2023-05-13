import {Chess, Move} from "chess.js";
import {LinearMoveSequence, Mv, Puzzle} from "./classesAndTypes";
import Feedback from "react-bootstrap/Feedback";

export type State = {
    Game: Chess;
    Fen: string;
    Orientation: boolean;
    CurPuzzle: Puzzle;
    Puzzles: Puzzle[];
    PuzzleMode: boolean;
    Feedback: string;
}

type Action = {
    Fen: string ;
    PuzzleMode: boolean ;
    Move: Move ;
    Feedback: string ;
    Puzzles: Puzzle[] ;
    PuzzleIdx: number ;
    Orientation: boolean;
}

function dispatchBoardState(old: State, {Fen}: Action){
    console.log("Dispatching to board state")
    if (old.PuzzleMode){
        // @ts-ignore
        old = dispatchAddPuzzle(old, {Puzzles:[old.CurPuzzle]})
        old = {...old, CurPuzzle:new Puzzle(new LinearMoveSequence([]), Fen)}
    }
    old.Game.load(Fen.toString());
    return {...old, Fen:Fen, Game:old.Game}
}

function dispatchPuzzleMode(old: State, {PuzzleMode}: Action){
    if (PuzzleMode && !old.PuzzleMode){
        old = {...old, CurPuzzle:new Puzzle(new LinearMoveSequence([]), old.Fen)}
    }
    return {...old, PuzzleMove:PuzzleMode}
}

function dispatchMove(old: State, {Move}: Action){
    old.Game.move(Move);
    return {...old, Game:old.Game, Fen:old.Game.fen()}
}

function dispatchFeedback(old: State, {Feedback}: Action){
    return {...old, Feedback:Feedback}
}

function dispatchAddPuzzle(old: State, {Puzzles}: Action){
    return {...old, Puzzles:[...old.Puzzles, ...Puzzles]}
}

function dispatchRemovePuzzle(old: State, {PuzzleIdx}: Action){
    return {...old, Puzzles:old.Puzzles.filter((_, idx) => idx !== PuzzleIdx)}
}

function dispatchOrientation(old: State, {Orientation}: Action){
    return {...old, Orientation:Orientation}
}

export function Reducer(old: State, action: Action): State {
    if (action.Fen !== undefined){
        return dispatchBoardState(old, action);
    } else if (action.PuzzleMode !== undefined){
        return dispatchPuzzleMode(old, action);
    } else if (action.Move !== undefined){
        return dispatchMove(old, action);
    } else if (action.Feedback !== undefined){
        return dispatchFeedback(old, action);
    } else if (action.Puzzles !== undefined){
        return dispatchAddPuzzle(old, action);
    } else if (action.PuzzleIdx !== undefined){
        return dispatchRemovePuzzle(old, action);
    } else if (action.Orientation !== undefined){
        return dispatchOrientation(old, action);
    } else {
        return old;
    }
}

export function NewState(): State {
    return {
        Game: new Chess(),
        Fen: 'start',
        Orientation: true,
        CurPuzzle: new Puzzle(new LinearMoveSequence([])),
        Puzzles: [],
        PuzzleMode: false,
        Feedback: 'White to move'
    }
}
