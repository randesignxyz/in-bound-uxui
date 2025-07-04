

interface FOCPage{
    id:number
    
}

interface FOCSearchParam{
     searchValue?:string
     status?:string
     sorter?:FOCSorterParam?
}

interface FOCSorterParam{
     receivedBy?:string
     customer?:string
     status?:string
}