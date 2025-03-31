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
  
    export interface Base {
      getActiveTable: () => Promise<Table>;
      onSelectionChange: (callback: (event: { data: { recordId: string; fieldId: string } }) => void) => void;
    }
  
    export interface Bitable {
      base: Base;
    }
  
    export const bitable: Bitable;
}