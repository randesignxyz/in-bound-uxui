

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
        name: string;
        description: string;
        priority: number;
}

interface Favorite {
        documentId: number;
}
interface unFavorit {
        documentId: number;
        id: number;
}
interface UserDataDTO {
        id: number;
        fullName: string;
        userName: string;
        department: number;
}
interface UserDataAdvanceSearchParam {

}
interface LookupDataDTO {
        id: number;
        name: string;
        code?: "TYPE"|"TERMTYPE"|"CURRENCY"|"CATEGORY";
        type?: string;
        seq?: number;
        active?: boolean;
}
interface LookupDataParam {
        code?:string;
        type?: string;
}

interface TableNotification {
        share: number;
        reminder: number;
}

interface VendorsDTO {
        id?: number;
        name: string;
        code: string;
        address?:string;
        phone?:string;
        country?:string;
}

interface SearchValueParam{
        searchValue?:string;
}