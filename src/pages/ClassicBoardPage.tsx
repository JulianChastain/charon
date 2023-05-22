import React, {createContext, useReducer} from "react";
import {Action, NewState, Reducer} from "../utils/reducer";
import {GameBoard} from "../components/GameBoard";
import {MoveTable} from "../components/MoveTable";
import {PuzzleList} from "../components/PuzzleList";
import {Mode} from "../utils/reducer";

export const AppContext = createContext({
    state: NewState(), dispatch: (action: Action) => {
    }
});

export function BoardPage(): JSX.Element {
    const [state, dispatch] = useReducer(Reducer, NewState());
    return (
        <AppContext.Provider value={{state, dispatch}}>
            <div className="flex justify-center items-center h-screen bg-nord0 text-nord6">
                <div className="flex flex-col items-center w-50">
                    <GameBoard/>
                </div>
                <div className="bg-scroll ml-10 border-4 rounded-lg border-nord1 p-8">
                    <div className="mb-5 p-5 border border-nord13 rounded">
                        {state.Feedback}
                    </div>
                    <div className="mb-5 flex space-x-12 mx-12">
                        <MoveTable/>
                        <PuzzleList/>
                    </div>
                    <div className="mb-5">
                        <input
                            type="text"
                            className="w-full p-2 border border-nord4 rounded text-nord0"
                            placeholder={state.Game.fen()}
                            onChange={(event) => {
                                // @ts-ignore
                                dispatch({Input: event.target.value});
                            }}
                        />
                    </div>
                    <div className="flex justify-between">
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2" onClick={() => {
                            // @ts-ignore
                            dispatch({Fen: state.Input});
                        }}>Load Fen
                        </button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2" onClick={() => {
                            // @ts-ignore
                            dispatch({Fen: state.Game.fen()});
                            // @ts-ignore
                            dispatch({PuzzleMode: Mode.EnterPuzzle});
                        }}>Start Puzzle
                        </button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2" onClick={() => {
                            // @ts-ignore
                            dispatch({Puzzles: [state.CurPuzzle]})
                            // @ts-ignore
                            dispatch({PuzzleMode: Mode.Sandbox});
                        }}>Finish Puzzle
                        </button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2">Load Puzzle</button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2" onClick={() => {
                            // @ts-ignore
                            dispatch({Orientation: !state.Orientation})
                        }}>Flip Board
                        </button>
                    </div>
                </div>
            </div>
        </AppContext.Provider>

    )
}

