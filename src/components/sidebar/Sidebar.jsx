import React, { useState } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
function Sidebar() {

  const [extended, setExtended] = useState(false)
  return (
    <div className='sidebar'>
        <div className="top">
            <div className="menu" onClick={() => setExtended(!extended)}>
            <img src={assets.menu_icon} alt="" />
            </div>
            <div className="new-chat">
                <img src={assets.plus_icon} alt="" />
                {extended?<p>New Chat</p>: null }
            </div>
            {extended?
            <div className="recent">
                <div className="recent-title">Recent</div>
                <div className="recent-entry">
                  <img src={assets.message_icon} alt="" />
                  <p>What is Recat</p>
                </div>
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