import {Chessboard} from "react-chessboard";
import React from "react";
import {MoveHandler} from "../utils/classesAndTypes";

export function GameBoard({boardFen, handler}: {boardFen: string, handler: MoveHandler}): JSX.Element {
    return (
        <Chessboard
            position={boardFen}
            onPieceDrop={handler}/>
    );
}
