import {useReducer} from "react";
import {NewState, Reducer} from "../utils/reducer";

export function PuzzleList() {
    const [state, dispatch] = useReducer(Reducer, NewState());
    return (
        <div>
            {
                state.Puzzles.map((puzzle, index) => {
                    return (<p>puzzle here</p>)
                })
            }
        </div>
    )
}