import {useContext} from "react";
import {AppContext} from "../pages/ClassicBoardPage";

export function defaultHandler() {
    const {state, dispatch} = useContext(AppContext)

}