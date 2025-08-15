import { createContext, use, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props)=>{

    const [input, setInput] = useState("")
    const [recentPrompt, setRecentPrompt] = useState("")
    const [previousPrompts, setPreviousPrompts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [resultData, setResultData] = useState("")

    
    const onSent = async(prompt)=>{
        setResultData("")
        setIsLoading(true)
        setShowResult(true)
        setRecentPrompt(input)
        const response =await runChat(input)
        setResultData(response)
        setIsLoading(false)
        setInput("")
    }


    const contextValue = {
        previousPrompts,
        setPreviousPrompts,
        recentPrompt,
        setRecentPrompt,
        showResult,
        isLoading,
        resultData,
        input,
        setInput,
        onSent,
       runChat
    }
    return (
        <Context.Provider value={contextValue}>
        {props.children}
        </Context.Provider>
    )
}

export default ContextProvider