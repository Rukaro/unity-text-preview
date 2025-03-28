import React, { useState, useEffect } from 'react'
import type { LarkBase } from '@lark-base-open/js-sdk'
import UnityTextPreview from './components/UnityTextPreview'

function App() {
  const [text, setText] = useState('')
  const [bitable, setBitable] = useState<LarkBase['bitable'] | null>(null)

  useEffect(() => {
    const initSDK = async () => {
      const { init } = await import('@lark-base-open/js-sdk')
      const larkBase = await init()
      setBitable(larkBase.bitable)
    }
    initSDK()
  }, [])

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