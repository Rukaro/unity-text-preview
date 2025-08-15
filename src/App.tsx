import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import TranslateIcon from '@mui/icons-material/Translate';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { styled } from '@mui/material/styles';
import { bitable } from '@lark-base-open/js-sdk';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './prism-unityrt.css';
import { SelectChangeEvent } from '@mui/material/Select';
import { ChromePicker } from 'react-color';
import type { ColorResult } from 'react-color';

// Add font face declaration
const fontFaceStyle = document.createElement('style');
fontFaceStyle.textContent = `
  @font-face {
    font-family: 'Alibaba PuHuiTi';
    src: url('/AlibabaPuHuiTi-3-105-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Alibaba PuHuiTi';
    src: url('/AlibabaPuHuiTi-3-105-Heavy.woff2') format('woff2');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }
`;
document.head.appendChild(fontFaceStyle);

const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: '#0E1F34',
  color: '#D2D2D2',
  fontFamily: '"Alibaba PuHuiTi", sans-serif',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  '& [style*="font-size"]': {
    fontSize: 'inherit',
  },
}));

// Predefined color categories
const semanticColors = {
  // 元素类型
  ice: '#1387E8',      // 冰霜
  fire: '#C01E18',     // 火焰
  nature: '#009500',   // 自然
  holy: '#F89C0A',     // 光明
  dark: '#930BC3',     // 黑暗
  
  // 稀有度
  common: '#70AEC3',   // 普通
  uncommon: '#20E92E', // 罕见
  rare: '#029DFF',     // 稀有
  epic: '#E776FF',     // 史诗
  legend: '#FEA95D',   // 传说
  
  // 情感倾向
  positive: '#43f76d', // 正面
  negative: '#f52528', // 负面
  neutral: '#14cbf9',  // 中立
  
  // 全部
  all: '#FFFFFF',      // 全部
};

// 语义颜色分类（用于UI显示）
const colorCategories = {
  element: {
    ice: semanticColors.ice,
    fire: semanticColors.fire,
    nature: semanticColors.nature,
    holy: semanticColors.holy,
    dark: semanticColors.dark,
  },
  rarity: {
    common: semanticColors.common,
    uncommon: semanticColors.uncommon,
    rare: semanticColors.rare,
    epic: semanticColors.epic,
    legend: semanticColors.legend,
  },
  emphasis: {
    positive: semanticColors.positive,
    negative: semanticColors.negative,
    neutral: semanticColors.neutral,
  },
};

// Special symbols
const specialSymbols = [
  { name: '软连接符', value: '\\u00AD', description: '软连接符（不可见连字符）' },
  { name: '不换行空格', value: '\\u00A0', description: '不换行空格' },
  { name: '制表符', value: '\\u0009', description: '制表符' },
  { name: '防止修剪间隙', value: '<space=0.25em>', description: '宽度为0.25em的空格' },
];

// Utility function to get contrast color
const getContrastColor = (hexcolor: string): string => {
  // Remove the # if present
  const color = hexcolor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// 支持的语言列表
const supportedLanguages = [
  { code: 'en', name: '英语' },
  { code: 'zh-CN', name: '简体中文' },
];

// 更新日志（按时间倒序排列）
const updateLogs = [
  {
    version: 'v1.3.0',
    date: '2025-01-27',
    content: '新增语义颜色系统，支持使用 <style=neutral> 等语义标签代替颜色值，包括元素类型、稀有度、情感倾向等分类。',
  },
  {
    version: 'v1.2.4',
    date: '2025-05-22',
    content: '调整了界面布局；新增清除操作；优化了自定义颜色的交互逻辑。',
  },
  {
    version: 'v1.2.3',
    date: '2025-05-21',
    content: '修复了字号没有按照相对大小添加和预览的bug。',
  },
  {
    version: 'v1.2.2',
    date: '2025-05-15',
    content: '增加代码高亮功能。',
  },
  {
    version: 'v1.2.1',
    date: '2025-05-15',
    content: '增加"全部大写"功能。',
  },
  {
    version: 'v1.2.0',
    date: '2025-05-14',
    content: '新增批量翻译功能。',
  },
  {
    version: 'v1.1.0',
    date: '2025-04-14',
    content: '允许编辑单元格内容。',
  },
  {
    version: 'v1.0.0',
    date: '2025-03-31',
    content: '仅支持预览的基础版本。',
  },
];

// 支持自定义标签高亮
Prism.languages.unityrt = {
  'unicode': {
    pattern: /\\u[0-9a-fA-F]{4}/g
  },
  'curly-param': {
    pattern: /\{[^}]+\}/g
  },
  'self-closing-tag': {
    // 只匹配 <br> 和 <space=...>
    pattern: /<(br|space=[^>]+)>/gi,
    inside: {
      'attr-value': /=[^>]+/,
      'punctuation': /[<>/]/
    }
  },
  'tag': {
    // 匹配开始标签
    pattern: /<[^>]+>/g,
    inside: {
      'attr-value': /=[^>]+/,
      'punctuation': /[<>/]/
    }
  },
  'tag-content': {
    // 匹配标签之间的内容
    pattern: /<[^>]+>([^<]*)<\/[^>]+>/g,
    inside: {
      'tag': /<\/?[^>]+>/,
      'content': {
        pattern: /[^<>]+/,
        alias: 'bold'
      }
    }
  },
  'style-tag': {
    // 匹配语义颜色标签
    pattern: /<style=[^>]+>([^<]*)<\/style>/g,
    inside: {
      'tag': /<\/?style[^>]*>/,
      'attr-value': /=[^>]+/,
      'punctuation': /[<>/]/,
      'content': {
        pattern: /[^<>]+/,
        alias: 'bold'
      }
    }
  },
  'string': /".*?"|'.*?'/,
  'number': /\b\d+(?:\.\d+)?%?\b/,
  'operator': /[=]/,
  'text': /[^<>]+/
};

// 实时高亮输入框组件
const highlightWithBold = (code: string) => {
  // 用栈处理嵌套 <color=...> 和 <style=...> 标签高亮，标签和内容都加 token-bold（用占位符实现）
  let result = '';
  let i = 0;
  const len = code.length;
  const stack: number[] = [];
  while (i < len) {
    // 匹配 <color=...> 或 <style=...>
    const open = code.slice(i).match(/^<(color|style)=[^>]+>/i);
    if (open) {
      result += '[[[TAG]]]' + open[0] + '[[[/TAG]]]';
      stack.push(i);
      i += open[0].length;
      continue;
    }
    // 匹配 </color> 或 </style>
    const close = code.slice(i).match(/^<\/(color|style)>/i);
    if (close) {
      result += '[[[TAG]]]' + close[0] + '[[[/TAG]]]';
      stack.pop();
      i += close[0].length;
      continue;
    }
    // 匹配其它标签（如 <b>、<u> 等）
    const tag = code.slice(i).match(/^<[^>]+>/i);
    if (tag) {
      result += tag[0];
      i += tag[0].length;
      continue;
    }
    // 在 <color> 或 <style> 区间内的内容加高亮
    let content = '';
    while (i < len) {
      if (code[i] === '<') break;
      content += code[i];
      i++;
    }
    if (stack.length > 0 && content) {
      result += '[[[BOLD]]]' + content + '[[[/BOLD]]]';
    } else {
      result += content;
    }
  }
  // Prism 高亮
  let html = Prism.highlight(result, Prism.languages.unityrt, 'unityrt');
  // 替换占位符为高亮 span
  html = html.replace(
    /\[\[\[TAG\]\]\]([\s\S]*?)\[\[\[\/TAG\]\]\]/g,
    '<span class="token-bold">$1</span>'
  );
  html = html.replace(
    /\[\[\[BOLD\]\]\]([\s\S]*?)\[\[\[\/BOLD\]\]\]/g,
    '<span class="token-bold">$1</span>'
  );
  return html;
};

const UnityRichTextEditor = ({ value, onChange, disabled, placeholder, style, ...props }: any) => (
  <Box sx={{ width: '100%' }}>
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={highlightWithBold}
      padding={12}
      textareaId="unity-rich-text-editor"
      placeholder={placeholder}
      style={{
        fontFamily: 'Alibaba PuHuiTi, sans-serif',
        fontSize: 16,
        lineHeight: 1.5,
        background: '#f5f6fa',
        color: '#222',
        borderRadius: 8,
        outline: 'none',
        border: '1px solid #ccc',
        boxShadow: 'none',
        ...style,
      }}
      textareaClassName="chinese-word-wrap-editor"
      preClassName="unity-editor-pre"
      disabled={disabled}
      textareaRef={props.textareaRef}
      {...props}
    />
  </Box>
);

// 插件使用文档内容
const useDoc = `
<div class="use-doc">

  <h2>工具栏功能</h2>
  <ul>
    <li>支持对光标选中文本插入<b>加粗</b>、<i>斜体</i>、<u>下划线</u>、<s>删除线</s>、<sup>上标</sup>、<sub>下标</sub>、<style=neutral>语义颜色</style>、<size=120%>字号</size>标签</li>
    <li>支持在光标所在位置插入软连接符、不换行空格、防修建间隙</li>
    <li>颜色、字号支持自定义选择</li>
  </ul>

  <h2>语义颜色说明</h2>
  <ul>
    <li><strong>元素类型：</strong>ice(冰霜)、fire(火焰)、nature(自然)、holy(光明)、dark(黑暗)</li>
    <li><strong>稀有度：</strong>common(普通)、uncommon(罕见)、rare(稀有)、epic(史诗)、legend(传说)</li>
    <li><strong>情感倾向：</strong>positive(正面)、negative(负面)、neutral(中立)</li>
    <li><strong>特殊：</strong>all(全部)</li>
    <li>使用语法：<code>&lt;style=neutral&gt;文本内容&lt;/style&gt;</code></li>
  </ul>

  <h2>操作区功能</h2>
  <ul>
    <li>选择单元格后可在输入框中直接编辑内容，支持语法高亮</li>
    <li>【翻译】查看中英文翻译结果，并支持保存译文到表格</li>
    <li>【字型】一键大小写转换，包括全大写、全小写、仅词首大写、仅句首大写</li>
    <li>【保存】将修改同步到多维表格，同时会将换行符转换为 br 标签</li>
    <li>【重置】将修改回退到多维表格的原始内容</li>
    <li>【清除】清除所有样式，仅保留纯文本和参数</li>
  </ul>

  <h2>预览区功能</h2>
  <ul>
    <li>默认开启分段显示，用于查看技能描述在局内的显示效果</li>
    <li>可设定背景颜色，查看不同背景颜色下的显示效果</li>
  </ul>

  <h2>注意事项：</h2>
  <ul>
    <li>修改后务必要点击保存才会同步到多维表格</li>
    <li>语义颜色标签使用 <code>&lt;style=xxx&gt;</code> 语法，传统颜色标签 <code>&lt;color=#xxxxxx&gt;</code> 仍然支持</li>
  </ul>
</div>
`;

function App() {
  const [text, setText] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [previewBgColor, setPreviewBgColor] = useState('#0E1F34');
  const defaultBgColor = '#0E1F34';
  const [hasSelection, setHasSelection] = useState(false);
  const [enableSegmentation, setEnableSegmentation] = useState(true);
  const [enableCenterAlignment, setEnableCenterAlignment] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [targetLanguage] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [allTranslatedTexts, setAllTranslatedTexts] = useState<{ [lang: string]: string }>({});
  const [activeLanguage, setActiveLanguage] = useState(targetLanguage);
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [customColor, setCustomColor] = useState('#222222');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Function to connect to Feishu Base
  const connectToBase = async () => {
    try {
      setIsConnected(true);
      
      // Set up event listener for cell selection
      setupCellSelectionListener();
      
      // Show success message
      setShowCopyAlert(true);
    } catch (error) {
      console.error('Failed to connect to Base:', error);
    }
  };

  // Auto-connect to Feishu Base when the component mounts
  useEffect(() => {
    connectToBase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to get cell value from selection
  const getCellValueFromSelection = async () => {
    try {
      // Get the current selection
      const selection = await bitable.base.getSelection();
      
      if (selection && selection.recordId && selection.fieldId) {
        setHasSelection(true);
        // Get the active table first
        const table = await bitable.base.getActiveTable();
        // Get the selected cell value
        const field = await table.getFieldById(selection.fieldId);
        
        // Get the cell value using the correct API
        const cellValue = await field.getValue(selection.recordId);
        
        // Process the cell value
        if (cellValue !== null && cellValue !== undefined) {
          let textValue = '';
          
          if (typeof cellValue === 'string') {
            textValue = cellValue;
          } else if (typeof cellValue === 'object') {
            if (cellValue.text !== undefined) {
              textValue = cellValue.text;
            } else if (cellValue.value !== undefined) {
              textValue = cellValue.value;
            } else if (Array.isArray(cellValue)) {
              textValue = cellValue.map(item => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item.text !== undefined) return item.text;
                return JSON.stringify(item);
              }).join(', ');
            } else {
              textValue = JSON.stringify(cellValue, null, 2);
            }
          } else {
            textValue = String(cellValue);
          }
          
          // Don't replace <br> with newlines, keep them as literal text
          console.log('Cell value:', textValue);
          return textValue;
        } else {
          return '';
        }
      } else {
        setHasSelection(false);
        return '';
      }
    } catch (error) {
      console.error('Failed to get cell value:', error);
      return '';
    }
  };

  // Function to set up cell selection listener
  const setupCellSelectionListener = useCallback(async (): Promise<() => void> => {
    try {
      // Set up a button to get the current selection (for manual triggering)
      const getSelectionButton = document.createElement('button');
      getSelectionButton.textContent = '获取选中单元格';
      getSelectionButton.style.display = 'none';
      document.body.appendChild(getSelectionButton);
      
      // Add event listener to the button
      getSelectionButton.addEventListener('click', async () => {
        const textValue = await getCellValueFromSelection();
        setText(textValue);
      });
      
      // Set up automatic detection of cell selection
      // We'll use a polling approach since the SDK doesn't provide a direct way to listen for selection changes
      let lastSelection = '';
      
      const checkSelection = async () => {
        try {
          const selection = await bitable.base.getSelection();
          const currentSelection = selection ? `${selection.recordId}-${selection.fieldId}` : '';
          
          // If the selection has changed, update the text field
          if (currentSelection !== lastSelection) {
            lastSelection = currentSelection;
            if (currentSelection !== '') {
              const textValue = await getCellValueFromSelection();
              setText(textValue);
            } else {
              setHasSelection(false);
            }
          }
        } catch (error) {
          console.error('Failed to check selection:', error);
        }
      };
      
      // Check for selection changes every 500ms
      const intervalId = setInterval(checkSelection, 500);
      
      // Return a cleanup function
      return () => {
        clearInterval(intervalId);
        document.body.removeChild(getSelectionButton);
      };
      
    } catch (error) {
      console.error('Failed to set up cell selection listener:', error);
      // Return an empty cleanup function in case of error
      return () => {};
    }
  }, []);

  // Set up the cell selection listener when the component mounts
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const setupListener = async () => {
      if (isConnected) {
        cleanup = await setupCellSelectionListener();
      }
    };
    
    setupListener();
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isConnected, setupCellSelectionListener]);

  // Function to update the selected cell with the provided value
  const updateSelectedCell = async (value: string) => {
    try {
      // Get the active table
      const selection = await bitable.base.getSelection();
      if (!selection || !selection.recordId || !selection.fieldId) {
        throw new Error('未选择单元格');
      }

      const table = await bitable.base.getActiveTable();
      if (!table) {
        throw new Error('无法获取表格');
      }

      const field = await table.getFieldById(selection.fieldId);
      if (!field) {
        throw new Error('无法获取字段');
      }

      // 保存 value 到单元格
      await field.setValue(selection.recordId, value);
      
      // 获取最新值同步到界面
      const updatedValue = await field.getValue(selection.recordId);
      let newText = '';
      
      // 处理 null 或 undefined 的情况
      if (updatedValue === null || updatedValue === undefined) {
        newText = '';
      } else if (typeof updatedValue === 'string') {
        newText = updatedValue;
      } else if (typeof updatedValue === 'object') {
        if (updatedValue.text !== undefined) {
          newText = updatedValue.text;
        } else if (updatedValue.value !== undefined) {
          newText = updatedValue.value;
        } else if (Array.isArray(updatedValue)) {
          newText = updatedValue.map((item: any) => {
            if (item === null || item === undefined) return '';
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item.text !== undefined) return item.text;
            return JSON.stringify(item);
          }).join(', ');
        } else {
          newText = JSON.stringify(updatedValue, null, 2);
        }
      } else {
        newText = String(updatedValue);
      }
      
      setText(newText);
      setSuccessMessage('保存成功');
      setShowSuccess(true);
    } catch (error) {
      console.error('保存失败:', error);
      setTranslationError('保存失败，请重试');
      // 保存失败时保持原有文本不变
      setText(text);
      throw error; // 重新抛出错误，让调用者知道保存失败
    }
  };

  // Function to insert markup at cursor position or around selection
  const insertMarkup = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById('unity-rich-text-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    let newText;
    if (start === end) {
      // No selection, just insert the tags at cursor position
      newText = currentText.substring(0, start) + openTag + closeTag + currentText.substring(end);
    } else {
      // Selection exists, wrap the selected text with the tags
      const selectedText = currentText.substring(start, end);
      newText = currentText.substring(0, start) + openTag + selectedText + closeTag + currentText.substring(end);
    }
    
    // Update the text state
    setText(newText);
    
    // Focus the textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      if (start === end) {
        textarea.setSelectionRange(start + openTag.length, start + openTag.length);
      } else {
        textarea.setSelectionRange(start + openTag.length, start + openTag.length + (end - start));
      }
    }, 0);
  };

  // Function to insert a special symbol at cursor position
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById('unity-rich-text-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = textarea.value.substring(0, start) + symbol + textarea.value.substring(end);
    setText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Function to convert plain text with markup to Unity rich text
  function convertToUnityRichText(text: string): string {
    // First, convert Unicode escape sequences to actual Unicode characters
    let html = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    });

    // 处理 <b> <i> <u> <s> <sup> <sub>
    html = html
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<s>(.*?)<\/s>/g, '<s>$1</s>')
      .replace(/<sup>(.*?)<\/sup>/g, '<sup>$1</sup>')
      .replace(/<sub>(.*?)<\/sub>/g, '<sub>$1</sub>');
    
    // 处理语义颜色标签 <style=xxx>
    html = html.replace(/<style=([^>]+)>(.*?)<\/style>/g, (match, styleName, content) => {
      const color = semanticColors[styleName as keyof typeof semanticColors];
      return color ? `<span style="color:${color}">${content}</span>` : match;
    });
    
    // 处理传统颜色标签 <color=xxx>（保持向后兼容）
    html = html.replace(/<color=([^>]+)>(.*?)<\/color>/g, '<span style="color:$1">$2</span>');
    
    // 处理 <size=xx%>
    html = html.replace(/<size=([^>]+)>(.*?)<\/size>/g, '<span style="font-size:$1">$2</span>');
    
    // 处理换行
    html = html.replace(/\n/g, '<br>');
    
    // 分段显示
    if (enableSegmentation) {
      const segments = html.split('|').filter(segment => segment.trim() !== '');
      if (segments.length > 1) {
        html = segments.map(segment =>
          `<div style="margin-bottom: 8px;">• ${segment.trim()}</div>`
        ).join('');
      }
    }
    return html;
  }

  // Function to reset preview background color to default
  const resetPreviewBgColor = () => {
    setPreviewBgColor(defaultBgColor);
  };

  // Function to reset text from selected cell
  const handleReset = async () => {
    const textValue = await getCellValueFromSelection();
    setText(textValue);
    setShowCopyAlert(true);
  };

  // Function to handle success alert close
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  // 智能分段：只翻译可见文本，不翻译标记
  function splitTextWithTags(text: string) {
    const regex = /(<[^>]+>|\{[^}]+\}|\[[^\]]+\])/g;
    let result: { type: 'text' | 'tag', value: string }[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      result.push({ type: 'tag', value: match[0] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      result.push({ type: 'text', value: text.slice(lastIndex) });
    }
    return result;
  }

  // 并发翻译所有语言
  const translateText = async () => {
    if (!text.trim()) {
      setTranslationError('请输入要翻译的文本');
      return;
    }
    setIsTranslating(true);
    setTranslationError('');
    setAllTranslatedTexts({});
    try {
      const segments = splitTextWithTags(text);
      // 并发请求所有语言
      const results = await Promise.all(
        supportedLanguages.map(async (lang) => {
          const translatedSegments = await Promise.all(
            segments.map(async seg => {
              if (seg.type === 'text' && seg.value.trim()) {
                const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang.code}&dt=t&q=${encodeURIComponent(seg.value)}`);
                if (!response.ok) throw new Error('翻译服务暂时不可用');
                const data = await response.json();
                let translated = '';
                if (data && data[0]) {
                  data[0].forEach((item: any) => {
                    if (item[0]) translated += item[0];
                  });
                }
                return translated;
              } else {
                return seg.value;
              }
            })
          );
          return { lang: lang.code, text: translatedSegments.join('') };
        })
      );
      const allTexts: { [lang: string]: string } = {};
      results.forEach(r => { allTexts[r.lang] = r.text; });
      setAllTranslatedTexts(allTexts);
      // 默认显示当前 targetLanguage
      setActiveLanguage(targetLanguage);
      setTranslatedText(allTexts[targetLanguage] || '');
    } catch (error) {
      console.error('翻译失败:', error);
      setTranslationError('翻译失败，请稍后再试');
    } finally {
      setIsTranslating(false);
    }
  };

  // 切换语言按钮
  const handleLanguageButtonClick = (lang: string) => {
    setActiveLanguage(lang);
    setTranslatedText(allTranslatedTexts[lang] || '');
  };

  // 通用的保存函数
  const handleSave = async (valueToSave: string) => {
    if (!hasSelection) {
      setTranslationError('请先选择一个单元格');
      return;
    }
    try {
      // 如果不是翻译保存，则将换行符替换为 <br>
      const textToSave = valueToSave === translatedText ? valueToSave : valueToSave.replace(/\n/g, '<br>');
      await updateSelectedCell(textToSave);
      setSuccessMessage('保存成功');
      setShowSuccess(true);
    } catch (e) {
      setTranslationError('保存失败，请重试');
      setShowSuccess(false);
    }
  };

  // 保存译文到选中单元格
  const handleSaveTranslation = async () => {
    if (!translatedText) {
      setTranslationError('没有可保存的译文');
      return;
    }
    await handleSave(translatedText);
  };

  // 打开翻译对话框时自动执行翻译
  const handleOpenTranslationDialog = () => {
    setShowTranslationDialog(true);
    setTimeout(() => {
      translateText();
    }, 0);
  };

  // 关闭翻译对话框
  const handleCloseTranslationDialog = () => {
    setShowTranslationDialog(false);
    setTranslatedText('');
    setTranslationError('');
  };

  // 自动弹出最近更新弹窗（每次有新日志时每台设备首次打开自动弹出）
  useEffect(() => {
    const latestVersion = updateLogs[0]?.version;
    if (!latestVersion) return;
    const storageKey = 'unity-text-preview-last-shown-update';
    const lastShown = localStorage.getItem(storageKey);
    if (lastShown !== latestVersion) {
      setShowUpdateDialog(true);
      localStorage.setItem(storageKey, latestVersion);
    }
  }, []);

  // 修改字号调整函数
  const handleFontSizeChange = (event: SelectChangeEvent<string>) => {
    const newSize = event.target.value;
    if (newSize === '') {
      return;
    }
    const sizeValue = parseFloat(newSize);
    if (!isNaN(sizeValue) && sizeValue > 0) {
      insertMarkup(`<size=${newSize}>`, '</size>');
    }
  };

  // 清除所有标签和参数，保留纯文本和 {xxx}
  function stripTagsAndParams(text: string): string {
    // 去除 <xxx>、</xxx>、[xxx] 等，保留 {xxx}
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/\[[^\]]+\]/g, '');
  }

  // 编辑区大小写转换函数
  const transformTextCase = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (!text) return;
    let transformedText = '';
    switch (type) {
      case 'upper':
        transformedText = text.toUpperCase();
        break;
      case 'lower':
        transformedText = text.toLowerCase();
        break;
      case 'title':
        transformedText = text.toLowerCase().replace(/(^|\s)(\S)/gu, (match, p1, p2) => p1 + p2.toUpperCase());
        break;
      case 'sentence':
        transformedText = text.toLowerCase();
        // Capitalize the first letter of the string
        if (transformedText.length > 0) {
          transformedText = transformedText.charAt(0).toUpperCase() + transformedText.slice(1);
        }
        // Capitalize the first letter after a period, exclamation, or question mark (including Chinese full stop)
        // It also handles cases where there are non-letter characters between the punctuation and the letter.
        transformedText = transformedText.replace(/([.?!。])([^\p{L}]*)(\p{L})/gu, (match, p1, p2, p3) => {
          return p1 + p2 + p3.toUpperCase();
        });
        break;
    }
    setText(transformedText);
  };



  // 修改颜色选择器的点击处理
  const handleColorPickerClick = (e: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(e.currentTarget);
    setShowColorPicker(true);
  };

  // 关闭颜色选择器但不添加标签
  const handleCloseWithoutTag = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setShowColorPicker(false);
    setColorPickerAnchor(null);
  };

  // 修改颜色选择器的外部点击处理
  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const picker = document.querySelector('.chrome-picker');
      const closeButton = document.querySelector('.color-picker-close');
      
      if (colorPickerAnchor && 
          !colorPickerAnchor.contains(target) && 
          !picker?.contains(target) &&
          !closeButton?.contains(target)) {
        // 自定义颜色仍然使用传统的 color 标签
        const textarea = document.getElementById('unity-rich-text-editor') as HTMLTextAreaElement | null;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;
          
          const openTag = `<color=${customColor}>`;
          const closeTag = '</color>';
          
          let newValue;
          if (start === end) {
            newValue = value.slice(0, start) + openTag + closeTag + value.slice(end);
          } else {
            const selectedText = value.slice(start, end);
            newValue = value.slice(0, start) + openTag + selectedText + closeTag + value.slice(end);
          }
          
          setText(newValue);
          
          requestAnimationFrame(() => {
            textarea.focus();
            if (start === end) {
              textarea.setSelectionRange(start + openTag.length, start + openTag.length);
            } else {
              textarea.setSelectionRange(start + openTag.length, start + openTag.length + (end - start));
            }
          });
        }
        setShowColorPicker(false);
        setColorPickerAnchor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker, colorPickerAnchor, customColor]);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Unity Text Editor
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setShowUpdateDialog(true)}>
              最近更新
            </Button>
            <Button variant="outlined" onClick={() => setShowDocDialog(true)}>
              使用说明
            </Button>
          </Box>
        </Box>
        
        <EditorContainer>
          <Box sx={{ mb: 2 }}>
            {/* 文本样式工具 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <ToggleButtonGroup size="small" sx={{ height: 36 }}>
                  <ToggleButton value="bold" onClick={() => insertMarkup('<b>', '</b>')} sx={{ height: 36, minHeight: 36 }}>
                    <FormatBoldIcon />
                  </ToggleButton>
                  <ToggleButton value="italic" onClick={() => insertMarkup('<i>', '</i>')} sx={{ height: 36, minHeight: 36 }}>
                    <FormatItalicIcon />
                  </ToggleButton>
                  <ToggleButton value="underline" onClick={() => insertMarkup('<u>', '</u>')} sx={{ height: 36, minHeight: 36 }}>
                    <FormatUnderlinedIcon />
                  </ToggleButton>
                  <ToggleButton value="strikethrough" onClick={() => insertMarkup('<s>', '</s>')} sx={{ height: 36, minHeight: 36 }}>
                    <FormatStrikethroughIcon />
                  </ToggleButton>
                  <ToggleButton value="superscript" onClick={() => insertMarkup('<sup>', '</sup>')} sx={{ height: 36, minHeight: 36 }}>
                    <SuperscriptIcon />
                  </ToggleButton>
                  <ToggleButton value="subscript" onClick={() => insertMarkup('<sub>', '</sub>')} sx={{ height: 36, minHeight: 36 }}>
                    <SubscriptIcon />
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 120, height: 36 }}>
                    <InputLabel sx={{ height: 36, lineHeight: '36px', display: 'flex', alignItems: 'center', fontSize: 16 }} shrink>字号</InputLabel>
                    <Select
                      value={"100%"}
                      label="字号"
                      onChange={handleFontSizeChange}
                      sx={{
                        height: 36,
                        minHeight: 36,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 16,
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          height: 36,
                          lineHeight: '36px',
                          paddingTop: 0,
                          paddingBottom: 0,
                          fontSize: 16,
                        }
                      }}
                      inputProps={{ sx: { height: 36, minHeight: 36, padding: '0 8px', display: 'flex', alignItems: 'center', fontSize: 16 } }}
                    >
                      <MenuItem value="">请选择字号</MenuItem>
                      <MenuItem value="50%" sx={{ fontSize: 16 }}>50%</MenuItem>
                      <MenuItem value="75%" sx={{ fontSize: 16 }}>75%</MenuItem>
                      <MenuItem value="100%" sx={{ fontSize: 16 }}>100%</MenuItem>
                      <MenuItem value="125%" sx={{ fontSize: 16 }}>125%</MenuItem>
                      <MenuItem value="150%" sx={{ fontSize: 16 }}>150%</MenuItem>
                      <MenuItem value="200%" sx={{ fontSize: 16 }}>200%</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Special Symbols Section */}
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ mr: 1, alignSelf: 'center' }}>特殊符号:</Typography>
                  {specialSymbols.map((symbol) => (
                    <Button
                      key={symbol.value}
                      variant="outlined"
                      size="small"
                      onClick={() => insertSymbol(symbol.value)}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      {symbol.name}
                    </Button>
                  ))}
                </Box>

                {/* Predefined Colors Section */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>稀有度:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {Object.entries(colorCategories.rarity).map(([key, color]) => (
                      <Button
                        key={key}
                        variant="outlined"
                        size="small"
                        onClick={() => insertMarkup(`<style=${key}>`, '</style>')}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 1,
                          backgroundColor: color,
                          color: getContrastColor(color),
                          border: '1px solid #ccc',
                        }}
                      >
                        {key === 'common' ? '普通' : 
                         key === 'uncommon' ? '罕见' : 
                         key === 'rare' ? '稀有' : 
                         key === 'epic' ? '史诗' : 
                         key === 'legend' ? '传说' : key}
                      </Button>
                    ))}
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>元素:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {Object.entries(colorCategories.element).map(([key, color]) => (
                      <Button
                        key={key}
                        variant="outlined"
                        size="small"
                        onClick={() => insertMarkup(`<style=${key}>`, '</style>')}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 1,
                          backgroundColor: color,
                          color: getContrastColor(color),
                          border: '1px solid #ccc',
                        }}
                      >
                        {key === 'ice' ? '冰霜' : 
                         key === 'fire' ? '火焰' : 
                         key === 'nature' ? '自然' : 
                         key === 'holy' ? '神圣' : 
                         key === 'dark' ? '暗影' : key}
                      </Button>
                    ))}
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>其他:</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {Object.entries(colorCategories.emphasis).map(([key, color]) => (
                      <Button
                        key={key}
                        variant="outlined"
                        size="small"
                        onClick={() => insertMarkup(`<style=${key}>`, '</style>')}
                        sx={{
                          minWidth: 'auto',
                          px: 1,
                          backgroundColor: color,
                          color: getContrastColor(color),
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          boxShadow: 'none',
                          fontWeight: 500
                        }}
                      >
                        {key === 'positive' ? '正面' :
                         key === 'negative' ? '负面' :
                         key === 'neutral' ? '中性' : key}
                      </Button>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleColorPickerClick}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        backgroundColor: customColor,
                        color: getContrastColor(customColor),
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        boxShadow: 'none',
                        fontWeight: 500
                      }}
                    >
                      自定义
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* 编辑器和操作按钮 */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <UnityRichTextEditor
                value={text}
                onChange={setText}
                disabled={!hasSelection}
                placeholder={hasSelection ? "在此输入文本..." : "选择一个单元格来显示内容"}
                style={{ minWidth: 0, flex: 1 }}
                textareaRef={editorRef}
              />
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: '200px',
                overflowY: 'auto',
                minWidth: 96,
                ml: 0
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenTranslationDialog}
                  sx={{ width: 88, height: 36, borderRadius: 1, p: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minWidth: 0, minHeight: 0, pl: 1 }}
                  disabled={!hasSelection}
                >
                  <TranslateIcon fontSize="small" style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 14 }}>翻译</span>
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    const menu = document.createElement('div');
                    menu.style.position = 'fixed';
                    menu.style.top = `${rect.bottom + 5}px`;
                    menu.style.left = `${rect.left}px`;
                    menu.style.backgroundColor = 'white';
                    menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    menu.style.borderRadius = '4px';
                    menu.style.zIndex = '13010';
                    menu.style.padding = '4px 0';
                    
                    const closeMenu = (e: MouseEvent) => {
                      if (!menu.contains(e.target as Node) && e.target !== button) {
                        if (document.body.contains(menu)) {
                          document.body.removeChild(menu);
                        }
                        document.removeEventListener('click', closeMenu);
                      }
                    };
                    
                    const fontMenuOptions = [
                      { label: '全部大写', action: () => transformTextCase('upper') },
                      { label: '全部小写', action: () => transformTextCase('lower') },
                      { label: '仅词首大写', action: () => transformTextCase('title') },
                      { label: '仅句首大写', action: () => transformTextCase('sentence') }
                    ];
                    
                    fontMenuOptions.forEach(option => {
                      const item = document.createElement('div');
                      item.style.padding = '8px 16px';
                      item.style.cursor = 'pointer';
                      item.style.whiteSpace = 'nowrap';
                      item.textContent = option.label;
                      item.onmouseover = () => item.style.backgroundColor = '#f5f5f5';
                      item.onmouseout = () => item.style.backgroundColor = 'transparent';
                      item.onclick = () => {
                        option.action();
                        if (document.body.contains(menu)) {
                          document.body.removeChild(menu);
                        }
                      };
                      menu.appendChild(item);
                    });
                    document.body.appendChild(menu);
                    setTimeout(() => document.addEventListener('click', closeMenu), 0);
                  }}
                  sx={{ width: 88, height: 36, borderRadius: 1, p: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minWidth: 0, minHeight: 0, pl: 1 }}
                  disabled={!hasSelection}
                >
                  <TextFieldsIcon fontSize="small" style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 14 }}>字型</span>
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSave(text)}
                  disabled={!isConnected || !hasSelection}
                  sx={{ width: 88, height: 36, borderRadius: 1, p: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minWidth: 0, minHeight: 0, pl: 1 }}
                >
                  <SaveIcon fontSize="small" style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 14 }}>保存</span>
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReset}
                  disabled={!isConnected}
                  sx={{ width: 88, height: 36, borderRadius: 1, p: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minWidth: 0, minHeight: 0, pl: 1 }}
                >
                  <RestartAltIcon fontSize="small" style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 14 }}>重置</span>
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setText(stripTagsAndParams(text))}
                  disabled={!text}
                  sx={{ width: 88, height: 36, borderRadius: 1, p: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minWidth: 0, minHeight: 0, pl: 1 }}
                >
                  <CleaningServicesIcon fontSize="small" style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 14 }}>清除</span>
                </Button>
              </Box>
            </Box>
          </Box>
        </EditorContainer>

        <PreviewContainer>
          {/* 预览设置：分段显示和背景颜色 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableSegmentation}
                    onChange={(e) => setEnableSegmentation(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#D2D2D2' }}>
                    启用分段显示
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={enableCenterAlignment}
                    onChange={(e) => setEnableCenterAlignment(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#D2D2D2' }}>
                    居中显示
                  </Typography>
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#D2D2D2' }}>
                背景颜色:
              </Typography>
              <input
                type="color"
                value={previewBgColor}
                onChange={(e) => setPreviewBgColor(e.target.value)}
                style={{ width: 50, height: 30, padding: 0, border: 'none' }}
              />
              <Typography variant="body2" sx={{ color: '#D2D2D2', minWidth: 70 }}>
                {previewBgColor}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={resetPreviewBgColor}
                sx={{ 
                  color: '#D2D2D2', 
                  borderColor: '#D2D2D2',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(210, 210, 210, 0.1)'
                  }
                }}
              >
                重置
              </Button>
            </Box>
          </Box>
          <Box 
            sx={{ 
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              fontFamily: 'Alibaba PuHuiTi, sans-serif',
              color: '#D2D2D2',
              backgroundColor: previewBgColor,
              padding: 2,
              borderRadius: 1,
              fontWeight: 'normal',
              textAlign: enableCenterAlignment ? 'center' : 'left',
              '& strong': { fontWeight: 'bold' },
              '& em': { fontStyle: 'italic' },
              '& u': { textDecoration: 'underline' },
              '& s': { textDecoration: 'line-through' },
              '& sup': { verticalAlign: 'super', fontSize: 'smaller' },
              '& sub': { verticalAlign: 'sub', fontSize: 'smaller' },
              '& [dir="rtl"]': { 
                textAlign: 'right',
                direction: 'rtl',
                unicodeBidi: 'embed'
              }
            }}
            dangerouslySetInnerHTML={{ __html: convertToUnityRichText(text) }}
          />
        </PreviewContainer>
      </Box>

      <Snackbar
        open={showCopyAlert}
        autoHideDuration={2000}
        onClose={() => setShowCopyAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: '50% !important', transform: 'translateY(-50%)' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {isConnected ? '已连接到多维表格' : '文本已复制到剪贴板！'}
        </Alert>
      </Snackbar>

      {/* Custom success alert that appears in the middle of the screen */}
      {showSuccess && (
        <Snackbar
          open={showSuccess}
          autoHideDuration={2000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ top: '50% !important', transform: 'translateY(-50%)' }}
        >
          <Alert 
            severity="success" 
            sx={{ 
              width: '80%', 
              maxWidth: '400px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {/* 翻译对话框 */}
      <Dialog 
        open={showTranslationDialog} 
        onClose={handleCloseTranslationDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>文本翻译</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            {/* 语言按钮组 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {supportedLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={activeLanguage === lang.code ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleLanguageButtonClick(lang.code)}
                  disabled={isTranslating || !allTranslatedTexts[lang.code]}
                >
                  {lang.name}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>原文</Typography>
                <UnityRichTextEditor
                  value={text}
                  onChange={setText}
                  disabled={true}
                  placeholder="选择一个单元格来显示内容"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>译文</Typography>
                <UnityRichTextEditor
                  value={translatedText}
                  onChange={setTranslatedText}
                  disabled={!translatedText}
                  placeholder="在此输入翻译后的文本..."
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveTranslation}
                    disabled={!translatedText || !hasSelection}
                  >
                    保存
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TextFieldsIcon />}
                    onClick={(e) => {
                      const button = e.currentTarget;
                      const rect = button.getBoundingClientRect();
                      const menu = document.createElement('div');
                      menu.style.position = 'fixed';
                      menu.style.top = `${rect.bottom + 5}px`;
                      menu.style.left = `${rect.left}px`;
                      menu.style.backgroundColor = 'white';
                      menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                      menu.style.borderRadius = '4px';
                      menu.style.zIndex = '13010';
                      menu.style.padding = '4px 0';
                      
                      const closeMenu = (e: MouseEvent) => {
                        if (!menu.contains(e.target as Node) && e.target !== button) {
                          if (document.body.contains(menu)) {
                            document.body.removeChild(menu);
                          }
                          document.removeEventListener('click', closeMenu);
                        }
                      };
                      
                      const fontMenuOptions = [
                        { label: '全部大写', action: () => transformTextCase('upper') },
                        { label: '全部小写', action: () => transformTextCase('lower') },
                        { label: '仅词首大写', action: () => transformTextCase('title') },
                        { label: '仅句首大写', action: () => transformTextCase('sentence') }
                      ];
                      
                      fontMenuOptions.forEach(option => {
                        const item = document.createElement('div');
                        item.style.padding = '8px 16px';
                        item.style.cursor = 'pointer';
                        item.style.whiteSpace = 'nowrap';
                        item.textContent = option.label;
                        item.onmouseover = () => item.style.backgroundColor = '#f5f5f5';
                        item.onmouseout = () => item.style.backgroundColor = 'transparent';
                        item.onclick = () => {
                          option.action();
                          if (document.body.contains(menu)) {
                            document.body.removeChild(menu);
                          }
                        };
                        menu.appendChild(item);
                      });
                      document.body.appendChild(menu);
                      setTimeout(() => document.addEventListener('click', closeMenu), 0);
                    }}
                    disabled={!translatedText}
                  >
                    字型
                  </Button>
                </Box>
              </Box>
            </Box>
            {translationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {translationError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTranslationDialog}>关闭</Button>
          <Button 
            onClick={translateText} 
            variant="contained" 
            disabled={isTranslating || !text.trim()}
            startIcon={isTranslating ? <CircularProgress size={20} /> : null}
          >
            {isTranslating ? '翻译中...' : '翻译'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* 复制成功提示 */}
      <Snackbar
        open={showCopySnackbar}
        autoHideDuration={1500}
        onClose={() => setShowCopySnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: '50% !important', transform: 'translateY(-50%)' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          翻译内容已复制到剪贴板！
        </Alert>
      </Snackbar>
      {/* 复制失败提示 */}
      {translationError && (
        <Snackbar
          open={!!translationError}
          autoHideDuration={2000}
          onClose={() => setTranslationError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ top: '50% !important', transform: 'translateY(-50%)' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {translationError}
          </Alert>
        </Snackbar>
      )}
      {/* 最近更新弹窗 */}
      <Dialog open={showUpdateDialog} onClose={() => setShowUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>最近更新</DialogTitle>
        <DialogContent>
          {updateLogs.map((log, idx) => (
            <Box key={log.version} sx={{ mb: 2, borderBottom: idx < updateLogs.length - 1 ? '1px solid #eee' : 'none', pb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{log.version} <Typography component="span" variant="body2" sx={{ color: '#888', ml: 1 }}>{log.date}</Typography></Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{log.content}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
      {/* 插件使用文档弹窗 */}
      <Dialog open={showDocDialog} onClose={() => setShowDocDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Unity Text Editor 插件使用说明</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            '& .use-doc': {
              fontSize: 16,
              lineHeight: 1.8,
              '& h1': {
                fontSize: '1.5em',
                fontWeight: 'bold',
                marginBottom: '1em',
                color: '#333'
              },
              '& h2': {
                fontSize: '1.2em',
                fontWeight: 'bold',
                marginTop: '1em',
                marginBottom: '0.5em',
                color: '#444'
              },
              '& ul': {
                margin: '0.5em 0',
                paddingLeft: '1.5em'
              },
              '& li': {
                marginBottom: '0.5em'
              },
              '& b, & i, & u, & s, & sup, & sub': {
                margin: '0 0.2em'
              }
            }
          }}>
            <div dangerouslySetInnerHTML={{ __html: useDoc }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDocDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
      {/* 自定义颜色选择弹窗 */}
      {showColorPicker && colorPickerAnchor && (
        <Box
          sx={{
            position: 'fixed',
            top: colorPickerAnchor.getBoundingClientRect().bottom + 8,
            left: colorPickerAnchor.getBoundingClientRect().left,
            zIndex: 20000,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box
              className="color-picker-close"
              onClick={handleCloseWithoutTag}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                }
              }}
            >
              <Typography
                sx={{
                  fontSize: 16,
                  lineHeight: 1,
                  color: '#666',
                  userSelect: 'none'
                }}
              >
                ×
              </Typography>
            </Box>
            <ChromePicker
              color={customColor}
              onChange={(color: ColorResult) => setCustomColor(color.hex)}
              onChangeComplete={(color: ColorResult) => setCustomColor(color.hex)}
              disableAlpha
            />
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default App; 