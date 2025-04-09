declare module '@lark-base-open/js-sdk' {
  export interface ISelection {
    recordId: string;
    fieldId: string;
  }

  export interface IField {
    id: string;
    name: string;
    type: string;
    getValue: (recordId: string) => Promise<any>;
    setValue: (recordId: string, value: any) => Promise<void>;
  }

  export interface IRecord {
    id: string;
    getCellValue: (fieldId: string) => Promise<any>;
    setCellValue: (fieldId: string, value: any) => Promise<void>;
  }

  export interface ITable {
    id: string;
    name: string;
    getFieldById: (fieldId: string) => Promise<IField>;
    getRecordById: (recordId: string) => Promise<IRecord>;
  }

  export interface IBase {
    getActiveTable: () => Promise<ITable>;
    getSelection: () => Promise<ISelection>;
  }

  export const bitable: {
    base: IBase;
  };
} 