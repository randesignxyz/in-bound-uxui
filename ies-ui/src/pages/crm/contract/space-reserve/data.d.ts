

interface SpaceReserveItem{
    id?:number,
    addressId:number,
    addressName?:string,
    contractId:number,
    name?:string,
    length:number,
    width:number,
    height?:number,
    hasAttribute:boolean,
    remark?:string,
    fileId?:string[],
    attribute?:SpaceReservedAttributeEntry[]
}

interface SpaceReservedAttributeEntry{
    id?:number,
    typeId:number,
    typeName?:string,
    name:string,
    quantity:number,
}
