import React, { useContext, useState } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
function Sidebar() {

  const [extended, setExtended] = useState(false)
  const {onSent, previousPrompts, setRecentPrompt,newChat} = useContext(Context)

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
   await onSent(prompt);
  };
  return (
    <div className='sidebar'>
        <div className="top">
            <div className="menu" onClick={() => setExtended(!extended)}>
            <img src={assets.menu_icon} alt="" />
            </div>
            <div onClick={newChat} className="new-chat">
                <img src={assets.plus_icon} alt="" />
                {extended?<p>New Chat</p>: null }
            </div>
            {extended?
            <div className="recent">
                <div className="recent-title">Recent</div>
                {previousPrompts.map((item, index)=>{
                  return(
                <div onClick={()=> loadPrompt(item)} className="recent-entry">
                  <img src={assets.message_icon} alt="" />
                  <p>{item.slice(0,18)}...</p>
                </div>
                  )
                })}
            </div>: null
             }
        </div>
        <div className="bottom">
          <div className="bottom-iteam recent-entry">
            <img src={assets.question_icon} alt="" />
            {extended ? <p>Help</p> : null}
          </div>
          <div className="bottom-iteam recent-entry">
            <img src={assets.history_icon} alt="" />
            {extended ? <p>Activity</p> : null}
          </div>
          <div className="bottom-iteam recent-entry">
            <img src={assets.setting_icon} alt="" />
            {extended ? <p>Settings</p> : null}
          </div>
        </div>
    </div>
    
  )
}

export default Sidebar