import React from 'react'
import Sidebarnew from '../components/Sidebarnew'
import Chatbox from '../components/Chatbox'
import Sidebar from '../components/Sidebar'
const App = () => {
  return (

    <div className='h-screen bg-black mt-0'> 
      
      <div className='h-full flex gap-1'>
        <sidebar />
        <Chatbox />
      </div>
        <Sidebarnew />

    </div>
    
  )
}

export default App
//sidebar,sidebar extension compression,chats,typing,pdf file upload,getting input text from typed text:
