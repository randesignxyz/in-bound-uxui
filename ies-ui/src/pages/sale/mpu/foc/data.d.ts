

interface FOCPage{
    id:number
    
}

interface FOCSearchParam{
     searchValue?:string
     advanceSearch:FreeOfChargeTrackingAdvanceSearch;
     sorter?:FOCSorterParam?
}

interface FOCSorterParam{
     receivedBy?:string
     customer?:string
     status?:string
}

interface FreeOfChargeTrackingDTO {
     id?:number,
     distributorCode?:string,
     distributorName?:string,
     distributorId?:number,
     salespersonName?:string,
     salespersonCode?:string,
     status?:string
     receivedDate?:moment.Moment,
     stockControlId:number,
     purchaseId:number,
     createdBy?:string,
     createdDate?:moment.Moment,
     lastModifiedBy?:string,
     lastModifiedDate?:moment.Moment;
     items:FreeOfChargeTrackingItemDTO[]
}

interface FreeOfChargeTrackingAdvanceSearch{
     sourceSupply?:string;
     status?:string
}

interface FreeOfChargeTrackingItemDTO {
     id?:number,
     focTrackingId:number,
     itemName?:string,
     itemId?:number,
     uom?:string,
     itemCode?:string,
     quantity:number,
}