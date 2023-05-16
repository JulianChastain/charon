import React, {createContext, useReducer} from "react";
import {Action, NewState, Reducer} from "../utils/reducer";
import {GameBoard} from "../components/GameBoard";

export const AppContext = createContext({state: NewState(), dispatch: (action: Action) => {}});

export function BoardPage(): JSX.Element {
    const [state, dispatch] = useReducer(Reducer, NewState());
    return (
        <AppContext.Provider value={{state, dispatch}}>
            <div className="flex justify-center items-center h-screen bg-nord0 text-nord6">
                <div className="flex flex-col items-center w-50">
                    <GameBoard/>
                </div>
                <div className="ml-10 border-4 rounded-lg border-nord1 p-8">
                    <div className="mb-5 p-5 border border-nord13 rounded">
                        {state.Feedback}
                    </div>
                    <div className="mb-5">
                        <table className="table-auto border">
                            <thead>
                            <tr>
                                <th className="px-5 py-2">Move</th>
                                <th className="px-5 py-2">Player</th>
                                <th className="px-5 py-2">Position</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
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
                        }}>Load Fen</button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2">Start Puzzle</button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2">Finish Puzzle</button>
                        <button className="bg-nord7 text-nord0 px-2 py-2 rounded ml-2">Load Puzzle</button>
                    </div>
                </div>
            </div>
        </AppContext.Provider>

    )
}

