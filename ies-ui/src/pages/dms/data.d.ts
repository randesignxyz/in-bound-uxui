

interface RouteParam {
        label: string;
        path: string;
        key: number;
}


interface GlobleSearch {
        searchValue: string;
        folderId?: number;
}


interface OrgUnitDTO {
        id: number;
        name:string;
        description:string;
        priority:number;
}

interface Favorite{
        documentId:number;
}
interface unFavorit{
        documentId:number;
        id:number;
        
}

interface UserDataDTO{
        id:number;
        fullName:string;
        userName:string;
        department:number;
}
interface UserDataAdvanceSearchParam{
        
}