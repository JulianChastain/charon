import {Chess} from "chess.js";
import React from "react";

export function GameState({game, boardFen}: { game: Chess, boardFen: string }): JSX.Element {
    return (
        <div className={"rowItem"}>
            <div style={{borderStyle: "1px solid black"}}>
                Chessboard: {boardFen}
            </div>
            <div style={{borderStyle: "1px solid black"}}>
                Gameboard: {game.fen()}
            </div>
        </div>
    );
}
