import React, { useEffect, useState } from 'react'
import type { Bitable } from '@lark-base-open/js-sdk'

interface UnityTextPreviewProps {
  text: string
}

const UnityTextPreview: React.FC<UnityTextPreviewProps> = ({ text }) => {
  const [defaultColor, setDefaultColor] = useState('#D2D2D2')

  const parseUnityRichText = (text: string) => {
    return text
      .replace(/<color=#([A-Fa-f0-9]{6})>/g, (_, color) => `<span style="color: #${color}">`)
      .replace(/<\/color>/g, '</span>')
      .replace(/<b>/g, '<strong>')
      .replace(/<\/b>/g, '</strong>')
      .replace(/<i>/g, '<em>')
      .replace(/<\/i>/g, '</em>')
      .replace(/<size=(\d+)>/g, (_, size) => `<span style="font-size: ${size}px">`)
      .replace(/<\/size>/g, '</span>')
  }

  return (
    <div className="preview-container">
      <div className="preview-controls">
        <div className="color-picker">
          <label>Default Color:</label>
          <input
            type="color"
            value={defaultColor}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDefaultColor(event.target.value)}
          />
          <span className="color-value">{defaultColor}</span>
          <button
            className="reset-button"
            onClick={() => setDefaultColor('#D2D2D2')}
          >
            Reset
          </button>
        </div>
      </div>
      <div
        className="preview-content"
        style={{ color: defaultColor }}
        dangerouslySetInnerHTML={{ __html: parseUnityRichText(text) }}
      />
    </div>
  )
}

export default UnityTextPreview