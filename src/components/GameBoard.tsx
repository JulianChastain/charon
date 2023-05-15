import {Chessboard} from "react-chessboard";
import React from "react";
import {MoveHandler} from "../utils/classesAndTypes";
import {AppContext} from "../pages/ClassicBoardPage";

export function GameBoard(): JSX.Element {
    const {state, dispatch} = React.useContext(AppContext);
    return (
        <Chessboard
            position={state.Fen}
            onPieceDrop={handler}/>
    );
}
