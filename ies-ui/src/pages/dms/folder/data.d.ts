import { TreeDataNode } from "antd";

interface FolderDTO{
    id:number;
    name:string;
    parentId:number;
    isDeleted:boolean;
    description:string;
    totalFolder:number;
    location?:string,
    type?:string;
    code?:string;
    libraryId?:number;
    department?:DepartmentDTO;
}

interface FolderCreate{
    id?:number;
    name:string;
    parentId?:number;
    description?:string;
    type?:string;
    location?:string
    libraryId?:number;
    departmentId?:number;
}

interface FolderSearchParam{
    searchValue?:string;
    advanceSearch:FolderAdvanceSearch
}

interface ListItemsView {
    id:number;
    name:string;
    description?:string;
    date?:Moment.moment;
    type?:string;
    size?:string;
    created?:string
}

interface FolderAdvanceSearch {
    parentId?:number;
    libraryId?:number;
    code?:string;
}

interface DataNode {
    title?: string;
    key: string;
    isLeaf?: boolean;
    children?: DataNode[];
    action?: React.ReactNode;
    icon?:React.ReactNode,
    type?:string,
    libraryId?:number;
    code?:string;
  
}
interface FolderMoveParam{
    moveId:number;
    moveToId:number;
    code?:string;
}