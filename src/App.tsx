import React, { useState, useEffect, useCallback } from 'react';
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
import { styled } from '@mui/material/styles';
import { bitable } from '@lark-base-open/js-sdk';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './prism-unityrt.css';
import { SelectChangeEvent } from '@mui/material/Select';

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
const colorCategories = {
  rarity: {
    normal: '#70AEC3',
    uncommon: '#20E92E',
    rare: '#029DFF',
    epic: '#E776FF',
    legendary: '#FEA95D',
  },
  element: {
    frost: '#1387E8',
    fire: '#C01E18',
    nature: '#009500',
    holy: '#F89C0A',
    shadow: '#930BC3',
  },
  emphasis: {
    neutral: '#14cbf9',
    positive: '#43f76d',
    negative: '#f52528',
  },
};

// Special symbols
const specialSymbols = [
  { name: '软连接符', value: '\\u00AD', description: '软连接符（不可见连字符）' },
  { name: '不换行空格', value: '\\u00A0', description: '不换行空格' },
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
  { code: 'ru', name: '俄语' },
  { code: 'de', name: '德语' },
  { code: 'fr', name: '法语' },
  { code: 'it', name: '意大利语' },
  { code: 'es', name: '西班牙语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'pl', name: '波兰语' },
  { code: 'ko', name: '韩语' },
  { code: 'ja', name: '日语' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁体中文' },
  { code: 'id', name: '印度尼西亚语' },
  { code: 'nl', name: '荷兰语' },
  { code: 'fi', name: '芬兰语' },
  { code: 'sv', name: '瑞典语' },
  { code: 'no', name: '挪威语' },
  { code: 'da', name: '丹麦语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'tr', name: '土耳其语' },
];

// 更新日志（按时间倒序排列）
const updateLogs = [
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
  'closing-tag': {
    // 其他需要闭合的标签
    pattern: /<\/?[a-z]+(?:=[^>]+)?>/gi,
    inside: {
      'attr-value': /=[^>]+/,
      'punctuation': /[<>/]/
    }
  },
  'string': /".*?"|'.*?'/,
  'number': /\b\d+(?:\.\d+)?%?\b/,
  'operator': /[=]/,
  'text': /[^<>]+/
};

// 实时高亮输入框组件
const UnityRichTextEditor = ({ value, onChange, disabled, placeholder, style, ...props }: any) => (
  <Box sx={{ width: '100%' }}>
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={code => Prism.highlight(code, Prism.languages.unityrt, 'unityrt')}
      padding={12}
      textareaId="unity-rich-text-editor"
      placeholder={placeholder}
      style={{
        fontFamily: 'Alibaba PuHuiTi, sans-serif',
        fontSize: 16,
        minHeight: 120,
        background: '#f5f6fa',
        color: '#222',
        borderRadius: 8,
        outline: 'none',
        border: '1px solid #ccc',
        boxShadow: 'none',
        ...style,
      }}
      disabled={disabled}
      {...props}
    />
  </Box>
);

function App() {
  const [text, setText] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [previewBgColor, setPreviewBgColor] = useState('#0E1F34');
  const defaultBgColor = '#0E1F34';
  const [hasSelection, setHasSelection] = useState(false);
  const [enableSegmentation, setEnableSegmentation] = useState(true);
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
    if (start === end) {
      // No selection, just insert the tags at cursor position
      const newText = text.substring(0, start) + openTag + closeTag + text.substring(end);
      setText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + openTag.length, start + openTag.length);
      }, 0);
    } else {
      // Selection exists, wrap the selected text with the tags
      const selectedText = text.substring(start, end);
      const newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
      setText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
      }, 0);
    }
  };

  // Function to insert a special symbol at cursor position
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById('unity-rich-text-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + symbol + text.substring(end);
    setText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Function to convert plain text with markup to Unity rich text
  function convertToUnityRichText(text: string): string {
    // 处理 <b> <i> <u> <s> <sup> <sub>
    let html = text
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<s>(.*?)<\/s>/g, '<s>$1</s>')
      .replace(/<sup>(.*?)<\/sup>/g, '<sup>$1</sup>')
      .replace(/<sub>(.*?)<\/sub>/g, '<sub>$1</sub>');
    // 处理 <color=xxx>
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

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Unity Text Editor
          </Typography>
          <Button variant="outlined" onClick={() => setShowUpdateDialog(true)}>
            最近更新
          </Button>
        </Box>
        
        <EditorContainer>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <ToggleButtonGroup size="small">
                <ToggleButton
                  value="bold"
                  onClick={() => insertMarkup('<b>', '</b>')}
                >
                  <FormatBoldIcon />
                </ToggleButton>
                <ToggleButton
                  value="italic"
                  onClick={() => insertMarkup('<i>', '</i>')}
                >
                  <FormatItalicIcon />
                </ToggleButton>
                <ToggleButton
                  value="underline"
                  onClick={() => insertMarkup('<u>', '</u>')}
                >
                  <FormatUnderlinedIcon />
                </ToggleButton>
                <ToggleButton
                  value="strikethrough"
                  onClick={() => insertMarkup('<s>', '</s>')}
                >
                  <FormatStrikethroughIcon />
                </ToggleButton>
                <ToggleButton
                  value="superscript"
                  onClick={() => insertMarkup('<sup>', '</sup>')}
                >
                  <SuperscriptIcon />
                </ToggleButton>
                <ToggleButton
                  value="subscript"
                  onClick={() => insertMarkup('<sub>', '</sub>')}
                >
                  <SubscriptIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableSegmentation}
                      onChange={(e) => setEnableSegmentation(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="启用分段显示"
                />
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TranslateIcon />}
                  onClick={handleOpenTranslationDialog}
                >
                  翻译
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>字号</InputLabel>
                <Select
                  value=""
                  label="字号"
                  onChange={handleFontSizeChange}
                >
                  <MenuItem value="">请选择字号</MenuItem>
                  <MenuItem value="50%">50%</MenuItem>
                  <MenuItem value="75%">75%</MenuItem>
                  <MenuItem value="100%">100%</MenuItem>
                  <MenuItem value="125%">125%</MenuItem>
                  <MenuItem value="150%">150%</MenuItem>
                  <MenuItem value="200%">200%</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const color = '#FF0000'; // 默认颜色，可以更改
                  insertMarkup(`<color=${color}>`, '</color>');
                }}
                sx={{ 
                  minWidth: 50, 
                  height: 30, 
                  border: '1px solid #ccc',
                }}
              >
                字体颜色
              </Button>
              
              <input
                type="color"
                onChange={(e) => {
                  const color = e.target.value;
                  insertMarkup(`<color=${color}>`, '</color>');
                }}
                style={{ width: 50, height: 30, padding: 0, border: 'none' }}
              />
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => insertMarkup('<color=#000000>', '</color>')}
                sx={{ 
                  minWidth: 'auto', 
                  px: 1,
                  height: 30,
                }}
              >
                默认颜色
              </Button>
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
                    onClick={() => insertMarkup(`<color=${color}>`, '</color>')}
                    sx={{ 
                      minWidth: 'auto', 
                      px: 1,
                      backgroundColor: color,
                      color: getContrastColor(color),
                      border: '1px solid #ccc',
                    }}
                  >
                    {key === 'normal' ? '普通' : 
                     key === 'uncommon' ? '罕见' : 
                     key === 'rare' ? '稀有' : 
                     key === 'epic' ? '史诗' : 
                     key === 'legendary' ? '传说' : key}
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
                    onClick={() => insertMarkup(`<color=${color}>`, '</color>')}
                    sx={{ 
                      minWidth: 'auto', 
                      px: 1,
                      backgroundColor: color,
                      color: getContrastColor(color),
                      border: '1px solid #ccc',
                    }}
                  >
                    {key === 'frost' ? '冰霜' : 
                     key === 'fire' ? '火焰' : 
                     key === 'nature' ? '自然' : 
                     key === 'holy' ? '神圣' : 
                     key === 'shadow' ? '暗影' : key}
                  </Button>
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>强调色:</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {Object.entries(colorCategories.emphasis).map(([key, color]) => (
                  <Button
                    key={key}
                    variant="outlined"
                    size="small"
                    onClick={() => insertMarkup(`<color=${color}>`, '</color>')}
                    sx={{ 
                      minWidth: 'auto', 
                      px: 1,
                      backgroundColor: color,
                      color: getContrastColor(color),
                      border: '1px solid #ccc',
                    }}
                  >
                    {key === 'neutral' ? '中性' : 
                     key === 'positive' ? '正面' : 
                     key === 'negative' ? '负面' : key}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <UnityRichTextEditor
              value={text}
              onChange={setText}
              disabled={!hasSelection}
              placeholder={hasSelection ? "在此输入文本..." : "选择一个单元格来显示内容"}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                disabled={!isConnected}
              >
                重置
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSave(text)}
                disabled={!isConnected || !hasSelection}
                startIcon={<SaveIcon />}
                sx={{
                  minWidth: '100px',
                  '&.Mui-disabled': {
                    backgroundColor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                保存
              </Button>
            </Box>
          </Box>
        </EditorContainer>

        <PreviewContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ color: '#D2D2D2' }}>
              预览:
            </Typography>
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
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              fontFamily: 'Alibaba PuHuiTi, sans-serif',
              color: '#D2D2D2',
              backgroundColor: previewBgColor,
              padding: 2,
              borderRadius: 1,
              fontWeight: 'normal',
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
                    onClick={() => setTranslatedText(translatedText.toUpperCase())}
                    disabled={!translatedText}
                  >
                    全部大写
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
    </Container>
  );
}

export default App; 