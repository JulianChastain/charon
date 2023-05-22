import {Chessboard} from "react-chessboard";
import React from "react";
import {AppContext} from "../pages/ClassicBoardPage";
import {MoveHandlerBuilder} from "../utils/moveHandler";


export function GameBoard(): JSX.Element {
    const {state, dispatch} = React.useContext(AppContext);
    console.log("Rerendering board to ", state.Game.fen());
    return (
        <Chessboard
            position={state.Game.fen()}
            onPieceDrop={new MoveHandlerBuilder(state, dispatch).handler}
            boardOrientation={state.Orientation ? "white" : "black"}
        />
    );
}
