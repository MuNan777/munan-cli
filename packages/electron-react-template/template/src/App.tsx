import React, { useState } from 'react';
import './App.css';
import { startUpInvoke } from './ipc/ipcRenderer';


function App () {

  const [text, setText] = useState('')

  startUpInvoke().then((data) => {
    setText(data)
  })

  return (
    <div className="App">
      {text}
    </div>
  );
}

export default App;
