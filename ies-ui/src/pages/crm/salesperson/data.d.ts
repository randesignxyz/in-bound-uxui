
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
    remark?:string;
    empNo?: string;
  }

  interface AddSalesperonOrg{

    parentId:number,
    saleId:number;
    position:string
    path?:string
  }

  interface SaleOrgAuditor{
    saleInfo?:SalespersonOrg
    parentInfo?:SalespersonOrg
    auditor?:SalespersonOrg[]
  }