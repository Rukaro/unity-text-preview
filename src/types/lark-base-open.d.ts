declare module '@lark-base-open/js-sdk' {
    export interface Field {
      getValue: (recordId: string) => Promise<any>;
    }
  
    export interface Record {
      id: string;
      record_id: string;
    }
  
    export interface Table {
      getField: (fieldId: string) => Promise<Field>;
      getRecordById: (recordId: string) => Promise<Record>;
    }
  
    export interface Bitable {
      getSelection: () => Promise<{
        tableId: string;
        recordId: string;
        fieldId: string;
        cellId: string;
      }>;
      onSelectionChange: (callback: (event: { data: { recordId: string; fieldId: string } }) => void) => void;
      getTable: (tableId: string) => Promise<Table>;
    }
  
    export interface LarkBase {
      bitable: Bitable;
    }
  
    export function init(): Promise<LarkBase>;
  }