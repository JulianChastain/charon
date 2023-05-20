import React from "react";
import {AppContext} from "../pages/ClassicBoardPage";
import {getTurns} from "../utils/classesAndTypes";

function MoveRows() {
    const {state} = React.useContext(AppContext);
    const moves = state.CurPuzzle.moves;
    try {
        return (
            <tbody>
            {
                getTurns(state.CurPuzzle).map((turn, idx) => (
                    <tr key={idx}>
                        <td className="border border-gray-200 px-4 py-2">{turn.White}</td>
                        <td className="border border-gray-200 px-4 py-2">{turn.Black}</td>
                    </tr>
                ))
            }
            </tbody>
        )
    } catch (e) {
        return (
            <tbody>
            <tr>
                <td>{moves.toString()}</td>
                <td>{moves.length > 0 ? moves[0].from + moves[0].to : ""}</td>
            </tr>
            </tbody>
        )
    }
}


export function MoveTable(): JSX.Element {
    return (
        <table className="rounded-lg border border-gray-200">
            <thead>
            <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">White</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Black</th>
            </tr>
            </thead>
            <MoveRows/>
        </table>
    )
}