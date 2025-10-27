export type ItemOnHandList = {
    id: number
    itemCode: string
    itemName: string
    uoMName: string
    onHand: number
    sapItemGroupId: number
    sapItemGroupName: string
    itemGroupId: number
    itemGroupName: string
    active: String
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
    groupIds?: number[]
    onHandFrom?: number | undefined
    onHandTo?: number | undefined
};
// export type UoM = {  
//     id: number
//     code: string
//     name?: string
// };