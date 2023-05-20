import {Chessboard} from "react-chessboard";
import React from "react";
import {MoveHandler, Mv} from "../utils/classesAndTypes";
import {AppContext} from "../pages/ClassicBoardPage";
import {Move, Square} from "chess.js";
import {State} from "../utils/reducer";

export function defaultHandler(state: State, dispatch: (action: any) => any): MoveHandler {
    return (sourceSquare: Square, targetSquare: Square): boolean => {
        if (state.Game
            .moves({verbose: true})
            .filter(({from, to}) =>
                from === sourceSquare &&
                to === targetSquare).map((move: Move) => {
                dispatch( state.PuzzleMode ?
                        {Feedback: state.Feedback[0] === 'E' ? move.san : state.Feedback + "," + move.san} :
                        {Feedback: move.san}
                )
            }).some(() => true)) {
            console.log("Move is legal");
            dispatch({Move: new Mv(sourceSquare, targetSquare)});
            return true;
        }
        return false;
    }
}

export function GameBoard(): JSX.Element {
    const {state, dispatch} = React.useContext(AppContext);
    console.log("Rerendering board to ", state.Game.fen());
    return (
        <Chessboard
            position={state.Game.fen()}
            onPieceDrop={defaultHandler(state, dispatch)}/>
    );
}
