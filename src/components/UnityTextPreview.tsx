import React, { useEffect, useState } from 'react';
import { bitable } from '@lark-base-open/js-sdk';
import '../styles.css';

// 默认颜色
const DEFAULT_COLOR = '#D2D2D2';

// 解析Unity支持的富文本标签和CSS样式
function parseUnityText(text: string, defaultColor: string): string {
    if (!text) return '';
    
    // 处理Unicode转义字符
    text = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
    });
    
    // 处理换行符
    text = text.replace(/<br>/g, '\n');
    
    // 处理颜色标签
    text = text.replace(/<color=([^>]+)>/g, (match, color) => {
        return `<span style="color: ${color}">`;
    });
    text = text.replace(/<\/color>/g, '</span>');
    
    // 处理加粗标签
    text = text.replace(/<b>/g, '<span class="unity-rich-text">');
    text = text.replace(/<\/b>/g, '</span>');
    
    // 处理斜体标签
    text = text.replace(/<i>/g, '<span class="unity-italic">');
    text = text.replace(/<\/i>/g, '</span>');
    
    // 处理下划线标签
    text = text.replace(/<u>/g, '<span class="unity-underline">');
    text = text.replace(/<\/u>/g, '</span>');
    
    // 处理删除线标签
    text = text.replace(/<s>/g, '<span class="unity-strikethrough">');
    text = text.replace(/<\/s>/g, '</span>');
    
    // 处理上标标签
    text = text.replace(/<sup>/g, '<span class="unity-superscript">');
    text = text.replace(/<\/sup>/g, '</span>');
    
    // 处理下标标签
    text = text.replace(/<sub>/g, '<span class="unity-subscript">');
    text = text.replace(/<\/sub>/g, '</span>');
    
    // 处理字体大小标签
    text = text.replace(/<size=(\d+)>/g, (match, size) => {
        return `<span style="font-size: ${size}px">`;
    });
    text = text.replace(/<\/size>/g, '</span>');
    
    // 处理对齐方式标签
    text = text.replace(/<align=([^>]+)>/g, (match, align) => {
        return `<div style="text-align: ${align}">`;
    });
    text = text.replace(/<\/align>/g, '</div>');
    
    // 添加默认颜色
    return `<div style="color: ${defaultColor}">${text}</div>`;
}

export const UnityTextPreview: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [defaultColor, setDefaultColor] = useState<string>(DEFAULT_COLOR);

    useEffect(() => {
        const initPlugin = async () => {
            try {
                // 获取当前表格
                const table = await bitable.base.getActiveTable();
                
                // 获取当前选中的单元格
                const selection = await bitable.base.getSelection();
                
                if (selection && selection.recordId && selection.fieldId) {
                    try {
                        // 获取字段
                        const field = await table.getFieldById(selection.fieldId);
                        
                        if (!field) {
                            console.error('找不到指定的字段');
                            return;
                        }

                        // 获取单元格
                        const cell = await field.getCell(selection.recordId);
                        
                        if (cell) {
                            const value = await cell.getValue();
                            
                            // 处理数组类型的值
                            if (Array.isArray(value) && value.length > 0) {
                                // 如果是数组，取第一个元素
                                const firstValue = value[0];
                                if (typeof firstValue === 'string') {
                                    setText(firstValue);
                                } else if (typeof firstValue === 'object' && firstValue.text) {
                                    // 如果第一个元素是对象且有text属性
                                    setText(firstValue.text);
                                } else {
                                    // 如果是其他类型，转换为字符串
                                    setText(String(firstValue));
                                }
                            } else if (typeof value === 'string') {
                                setText(value);
                            }
                        }
                    } catch (error) {
                        console.error('获取单元格内容失败:', error);
                    }
                }
                
                // 监听选择变化
                bitable.base.onSelectionChange(async (event) => {
                    try {
                        const selection = await bitable.base.getSelection();
                        
                        if (!selection || !selection.recordId || !selection.fieldId) {
                            return;
                        }
                        
                        // 获取字段
                        const field = await table.getFieldById(selection.fieldId);
                        
                        if (!field) {
                            console.error('找不到指定的字段');
                            return;
                        }

                        // 获取单元格
                        const cell = await field.getCell(selection.recordId);
                        
                        if (cell) {
                            const value = await cell.getValue();
                            
                            // 处理数组类型的值
                            if (Array.isArray(value) && value.length > 0) {
                                // 如果是数组，取第一个元素
                                const firstValue = value[0];
                                if (typeof firstValue === 'string') {
                                    setText(firstValue);
                                } else if (typeof firstValue === 'object' && firstValue.text) {
                                    // 如果第一个元素是对象且有text属性
                                    setText(firstValue.text);
                                } else {
                                    // 如果是其他类型，转换为字符串
                                    setText(String(firstValue));
                                }
                            } else if (typeof value === 'string') {
                                setText(value);
                            }
                        }
                    } catch (error) {
                        console.error('获取单元格内容失败:', error);
                    }
                });
            } catch (error) {
                console.error('初始化失败:', error);
            }
        };

        initPlugin();
    }, []);

    return (
        <div className="preview-container">
            <div className="preview-controls">
                <div className="color-picker">
                    <label htmlFor="default-color">默认字体颜色:</label>
                    <input
                        type="color"
                        id="default-color"
                        value={defaultColor}
                        onChange={(e) => setDefaultColor(e.target.value)}
                    />
                    <button 
                        className="reset-button"
                        onClick={() => setDefaultColor(DEFAULT_COLOR)}
                    >
                        重置
                    </button>
                </div>
            </div>
            <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: parseUnityText(text, defaultColor) }}
            />
        </div>
    );
}; 