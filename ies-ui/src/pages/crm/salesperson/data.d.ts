
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
    name?: string;
    id: number;
    path: string;
    parentId?: number;
    saleId: number;
    empNo?: string;
  }

  interface AddSalesperonOrg{

    parentId:number,
    saleId:number;
    position:string
    path?:string
  }