
interface CustomDataNode extends DataNode {
    key: string | number;
    title: string;
    path:string;
    position?:string;
    saleId:number;
    children?: CustomDataNode[];
  }

interface SalespersonOrg {
    position: string;
    name: string | null;
    id: number;
    path: string;
    parentId: number | null;
    saleId: number;
    empNo: string | null;
  }