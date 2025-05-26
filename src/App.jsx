import React from 'react'
import Sidebarnew from '../components/Sidebarnew'
import Chatbox from '../components/Chatbox'

const App = () => {
  return (

    <div className='h-screen bg-black mt-0 flex gap-1'> 
        <Sidebarnew />
        <Chatbox />        
    </div>
    
  )
}

export default App
//sidebar,sidebar extension compression,chats,typing,pdf file upload,getting input text from typed text:
