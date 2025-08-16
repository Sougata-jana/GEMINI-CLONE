import { createContext,  useState, useRef } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props)=>{

    const [input, setInput] = useState("")
    const [recentPrompt, setRecentPrompt] = useState("")
    const [previousPrompts, setPreviousPrompts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [resultData, setResultData] = useState("")
    const fullRawRef = useRef("")
    const typingTimerRef = useRef(null)
    const abortTypingRef = useRef(false)

    // Convert markdown subset (headings ####/###/##/#, **bold**, lists, code fences, hr) to HTML.
    const markdownToHtml = (raw) => {
        if(!raw) return '';
        const escapeMap = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' };
        let txt = raw.replace(/[&<>"']/g, ch => escapeMap[ch]);
        txt = txt.replace(/\r\n?/g,'\n');
        // Code fences ```lang\n...\n```
        txt = txt.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
            const safe = code.replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return `<pre><code class="lang-${lang||'plain'}">${safe}</code></pre>`;
        });
        // Horizontal rule --- on its own line
        txt = txt.replace(/^---$/gm,'<hr/>');
        // Headings (order matters)
        txt = txt.replace(/^####\s+(.+)$/gm,'<h4>$1</h4>');
        txt = txt.replace(/^###\s+(.+)$/gm,'<h3>$1</h3>');
        txt = txt.replace(/^##\s+(.+)$/gm,'<h2>$1</h2>');
        txt = txt.replace(/^#\s+(.+)$/gm,'<h1>$1</h1>');
        // Bold **text**
        txt = txt.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
        // Unordered lists: group consecutive lines starting with * or -
        txt = txt.replace(/^(?:[\t ]*[*-]\s.+(?:\n|$))+?/gm, block => {
            const items = block.trim().split(/\n/).map(l => l.replace(/^[\t ]*[*-]\s+/,'')).map(li => `<li>${li}</li>`).join('');
            return `<ul>${items}</ul>`;
        });
        // Paragraphs: double newline
        txt = txt.replace(/\n{2,}/g,'</p><p>');
        // Single newline
        txt = txt.replace(/\n/g,'<br/>');
        if(!/^\s*<h\d|^\s*<p>|^\s*<ul|^\s*<blockquote/.test(txt)){
            txt = '<p>' + txt + '</p>';
        }
        return txt;
    };

    const startTyping = (rawText) => {
        // Cancel any existing typing
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        abortTypingRef.current = false;
        const total = rawText.length;
        const stepChars = 1; // adjust speed granularity
        const delayMs = 12; // typing speed
        const typeLoop = (i) => {
            if (abortTypingRef.current) return; // aborted by new prompt
            if (i >= total) {
                // Ensure final full render
                setResultData(markdownToHtml(rawText));
                console.log('Full response (final):', rawText);
                return;
            }
            const slice = rawText.slice(0, i + stepChars);
            setResultData(markdownToHtml(slice));
            typingTimerRef.current = setTimeout(() => typeLoop(i + stepChars), delayMs);
        };
        typeLoop(0);
    };

    const newChat = ()=>{
        setIsLoading(false)
        setShowResult(false)
    }

    const onSent = async (prompt) => {
        // Abort any ongoing typing
        abortTypingRef.current = true;
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

        const effectivePrompt = (prompt && prompt.trim()) ? prompt : input;
        if(!effectivePrompt) return;

        setResultData("");
        setIsLoading(true);
        setShowResult(true);
        setRecentPrompt(effectivePrompt);
        setPreviousPrompts(prev => [effectivePrompt, ...prev.filter(p => p !== effectivePrompt)]); // move to top, de-dup
        try {
            const response = await runChat(effectivePrompt);
            fullRawRef.current = response || "";
            setIsLoading(false);
            startTyping(fullRawRef.current);
        } catch (e){
            setIsLoading(false);
            setResultData('Error: ' + (e?.message || 'unknown'));
        } finally {
            setInput("");
        }
    };


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
       runChat,
       newChat
    }
    return (
        <Context.Provider value={contextValue}>
        {props.children}
        </Context.Provider>
    )
}

export default ContextProvider