import React from 'react'
import ReactDOM from 'react-dom/client'
import { bitable } from '@lark-base-open/js-sdk'
import { UnityTextPreview } from './components/UnityTextPreview'
import './styles.css'

// 初始化插件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnityTextPreview />
  </React.StrictMode>
)