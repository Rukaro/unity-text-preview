import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { bitable } from '@lark-base-open/js-sdk'
import { UnityTextPreview } from './components/UnityTextPreview'
import './styles.css'

const App: React.FC = () => {
  const [selectedText, setSelectedText] = useState('')

  useEffect(() => {
    const fn = async () => {
      try {
        console.log('Getting active table...')
        const table = await bitable.base.getActiveTable()
        console.log('Got active table:', table)

        // 监听选中单元格变化
        bitable.base.onSelectionChange(async (event: { data: { recordId: string; fieldId: string } }) => {
          console.log('Selection changed:', event)
          const { data } = event
          const { recordId, fieldId } = data
          if (recordId && fieldId) {
            try {
              // 获取字段
              const field = await table.getField(fieldId)
              console.log('Got field:', field)
              
              // 获取记录
              const record = await table.getRecordById(recordId)
              console.log('Got record:', record)
              
              // 获取单元格值
              const cellValue = await field.getValue(recordId)
              console.log('Got cell value:', cellValue)
              
              // 处理单元格值
              let textValue = ''
              if (cellValue) {
                if (Array.isArray(cellValue) && cellValue.length > 0) {
                  // 如果是数组，获取第一个元素的text属性
                  textValue = cellValue[0].text || ''
                } else if (typeof cellValue === 'object') {
                  // 如果是对象，获取text属性
                  textValue = (cellValue as any).text || ''
                } else if (typeof cellValue === 'string') {
                  textValue = cellValue
                } else {
                  textValue = String(cellValue)
                }
              }
              console.log('Processed text value:', textValue)
              setSelectedText(textValue)
            } catch (error) {
              console.error('Error getting cell value:', error)
            }
          } else {
            console.log('No recordId or fieldId in event')
          }
        })
      } catch (error) {
        console.error('Failed to initialize:', error)
      }
    }
    fn()
  }, [])

  console.log('Current selected text:', selectedText)
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <div>Preview:</div>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          Selected Text: {selectedText || 'No text selected'}
        </pre>
      </div>
      <UnityTextPreview text={selectedText} />
    </div>
  )
}

// 初始化插件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)