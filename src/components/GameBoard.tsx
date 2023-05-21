import {Chessboard} from "react-chessboard";
import React from "react";
import {AppContext} from "../pages/ClassicBoardPage";
import {defaultHandler} from "../utils/moveHandler";


export function GameBoard(): JSX.Element {
    const {state, dispatch} = React.useContext(AppContext);
    console.log("Rerendering board to ", state.Game.fen());
    return (
        <Chessboard
            position={state.Game.fen()}
            onPieceDrop={defaultHandler(state, dispatch)}/>
    );
}
