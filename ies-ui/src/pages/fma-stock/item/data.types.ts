export type ItemList = {
    id: number
    itemCode: string
    itemAbr: string
    itemName: string
    description?: string
    defaultUoM: string
    itemGroup: {
        id: number
        itemGroupName: string
    };
}
export type ItemDetail = {
    id: number
    itemCode: string
    itemAbr: string
    itemName: string
    active:string
    isActiveY:boolean
    defaultUoM: string
    decription: string
    itemGroup: {
        id: number
        itemGroupName: string
    };
}

export type SearchItemParams  = {    
    searchValue?: string,
    advanceSearch?: ItemAdvanceSearchParams

}
export type SaveItemData = {
    id: number
    itemCode: string
    itemAbr: string
    itemName: string
    defaultUoM: string
    description?: string
    status:string
    isActiveY:boolean
    groupId: number
}
export type ItemAdvanceSearchParams = {  
    status: 'ALL'| 'Y' | 'N'
    groupIds?: number[];
  };