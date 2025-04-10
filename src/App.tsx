import React, { useState, useRef, useEffect } from 'react';
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
  TextField,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { styled } from '@mui/material/styles';
import { bitable } from '@lark-base-open/js-sdk';

// Add font face declaration
const fontFaceStyle = document.createElement('style');
fontFaceStyle.textContent = `
  @font-face {
    font-family: 'Alibaba PuHuiTi';
    src: url('/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.woff2') format('woff2'),
         url('/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.woff') format('woff'),
         url('/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.ttf') format('truetype'),
         url('/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.otf') format('opentype'),
         url('/AlibabaPuHuiTi-3-105-Heavy/AlibabaPuHuiTi-3-105-Heavy.eot') format('embedded-opentype');
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
  fontFamily: 'Alibaba PuHuiTi, sans-serif',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
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

function App() {
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [previewBgColor, setPreviewBgColor] = useState('#0E1F34');
  const defaultBgColor = '#0E1F34';

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
      // Get the active table
      const table = await bitable.base.getActiveTable();
      
      // Get the current selection
      const selection = await bitable.base.getSelection();
      
      if (selection && selection.recordId && selection.fieldId) {
        // Get the selected cell value
        const field = await table.getFieldById(selection.fieldId);
        
        // Get the cell value using the correct API
        const cellValue = await field.getValue(selection.recordId);
        
        // Update the text field with the cell value
        if (cellValue !== null && cellValue !== undefined) {
          // Handle different types of cell values
          let textValue = '';
          
          if (typeof cellValue === 'string') {
            // If it's already a string, use it directly
            textValue = cellValue;
          } else if (typeof cellValue === 'object') {
            // If it's an object, try to extract text content
            if (cellValue.text !== undefined) {
              // Some field types store text in a 'text' property
              textValue = cellValue.text;
            } else if (cellValue.value !== undefined) {
              // Some field types store text in a 'value' property
              textValue = cellValue.value;
            } else if (Array.isArray(cellValue)) {
              // If it's an array, join the elements
              textValue = cellValue.map(item => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item.text !== undefined) return item.text;
                return JSON.stringify(item);
              }).join(', ');
            } else {
              // If we can't extract text, stringify the object
              textValue = JSON.stringify(cellValue, null, 2);
            }
          } else {
            // For other types, convert to string
            textValue = String(cellValue);
          }
          
          return textValue;
        }
      }
      return '';
    } catch (error) {
      console.error('Failed to get cell value:', error);
      return '';
    }
  };

  // Function to set up cell selection listener
  const setupCellSelectionListener = async (): Promise<() => void> => {
    try {
      // Get the active table
      const table = await bitable.base.getActiveTable();
      
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
          if (currentSelection !== lastSelection && currentSelection !== '') {
            lastSelection = currentSelection;
            const textValue = await getCellValueFromSelection();
            setText(textValue);
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
  };

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
  }, [isConnected]);

  // Function to update the selected cell with the current text
  const updateSelectedCell = async () => {
    try {
      // Get the active table
      const table = await bitable.base.getActiveTable();
      
      // Get the current selection
      const selection = await bitable.base.getSelection();
      
      if (selection && selection.recordId && selection.fieldId) {
        // Get the field
        const field = await table.getFieldById(selection.fieldId);
        
        // Update the cell value
        await field.setValue(selection.recordId, text);
        
        // Show success message
        setShowCopyAlert(true);
      }
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
  };

  // Function to insert markup at cursor position or around selection
  const insertMarkup = (openTag: string, closeTag: string) => {
    if (!textFieldRef.current) return;
    
    const textarea = textFieldRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // No selection, just insert the tags at cursor position
      const newText = text.substring(0, start) + openTag + closeTag + text.substring(end);
      setText(newText);
      
      // Set cursor position between the tags
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + openTag.length, start + openTag.length);
      }, 0);
    } else {
      // Selection exists, wrap the selected text with the tags
      const selectedText = text.substring(start, end);
      const newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
      setText(newText);
      
      // Set cursor position after the closing tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + openTag.length + selectedText.length + closeTag.length, 
                                  start + openTag.length + selectedText.length + closeTag.length);
      }, 0);
    }
  };

  // Function to insert a special symbol at cursor position
  const insertSymbol = (symbol: string) => {
    if (!textFieldRef.current) return;
    
    const textarea = textFieldRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newText = text.substring(0, start) + symbol + text.substring(end);
    setText(newText);
    
    // Set cursor position after the inserted symbol
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Function to handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Function to convert plain text with markup to Unity rich text
  const convertToUnityRichText = (plainText: string): string => {
    // Create a temporary div to parse the markup
    const tempDiv = document.createElement('div');
    
    // Replace Unity rich text tags with HTML tags
    let htmlText = plainText
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<s>(.*?)<\/s>/g, '<s>$1</s>')
      .replace(/<sup>(.*?)<\/sup>/g, '<sup>$1</sup>')
      .replace(/<sub>(.*?)<\/sub>/g, '<sub>$1</sub>')
      .replace(/<size=([\d.]+)>(.*?)<\/size>/g, (match, size, content) => {
        const fontSize = parseFloat(size) * 100;
        return `<span style="font-size: ${fontSize}%">${content}</span>`;
      })
      .replace(/<color=([^>]+)>(.*?)<\/color>/g, (match, color, content) => {
        return `<span style="color: ${color}">${content}</span>`;
      })
      .replace(/\\u00AD/g, '&shy;') // Soft hyphen
      .replace(/\\u00A0/g, '&nbsp;') // Non-breaking space
      .replace(/<space=([^>]+)>/g, '<span style="margin-right: $1"></span>'); // Custom space
    
    // Set the HTML content
    tempDiv.innerHTML = htmlText;
    
    // Return the HTML content
    return tempDiv.innerHTML;
  };

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

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unity Text Editor
        </Typography>
        
        <EditorContainer>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup size="small" sx={{ mb: 1 }}>
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

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>字号</InputLabel>
                <Select
                  value={1}
                  label="字号"
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    insertMarkup(`<size=${size}>`, '</size>');
                  }}
                >
                  <MenuItem value={0.5}>50%</MenuItem>
                  <MenuItem value={0.75}>75%</MenuItem>
                  <MenuItem value={1}>100%</MenuItem>
                  <MenuItem value={1.25}>125%</MenuItem>
                  <MenuItem value={1.5}>150%</MenuItem>
                  <MenuItem value={2}>200%</MenuItem>
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
            <TextField
              inputRef={textFieldRef}
              fullWidth
              multiline
              rows={6}
              value={text}
              onChange={handleTextChange}
              variant="outlined"
              placeholder="在此输入文本..."
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
                onClick={updateSelectedCell}
                disabled={!isConnected}
              >
                更新单元格
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
              '& strong': { fontWeight: 'bold' },
              '& em': { fontStyle: 'italic' },
              '& u': { textDecoration: 'underline' },
              '& s': { textDecoration: 'line-through' },
              '& sup': { verticalAlign: 'super', fontSize: 'smaller' },
              '& sub': { verticalAlign: 'sub', fontSize: 'smaller' },
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
    </Container>
  );
}

export default App; 