import React, { useState } from 'react'
import { UnityTextPreview } from './components/UnityTextPreview'

function App() {
  const [text, setText] = useState('')

  return (
    <div className="app">
      <textarea
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        placeholder="Enter Unity rich text..."
        className="input"
      />
      <UnityTextPreview text={text} />
    </div>
  )
}

export default App 