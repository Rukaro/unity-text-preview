declare module 'react-color' {
  import * as React from 'react';
  export interface Color {
    hex: string;
    rgb: { r: number; g: number; b: number; a: number };
    hsl: { h: number; s: number; l: number; a: number };
  }
  export interface ChromePickerProps {
    color: string | Color;
    onChange?: (color: Color, event: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeComplete?: (color: Color, event: React.ChangeEvent<HTMLInputElement>) => void;
    disableAlpha?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }
  export class ChromePicker extends React.Component<ChromePickerProps> {}
} 