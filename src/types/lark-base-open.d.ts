declare module '@lark-base-open/js-sdk' {
    export interface Bitable {
      getSelection: () => Promise<{
        tableId: string;
        recordId: string;
        fieldId: string;
        cellId: string;
      }>;
    }
  
    export interface LarkBase {
      bitable: Bitable;
    }
  
    export function init(): Promise<LarkBase>;
  }