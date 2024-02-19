import { List } from "lodash";
import { Moment } from "moment";


interface GroupDTO{
    id:number;
    name:string;
    description:string,
    isDeleted:boolean;
    userList:GroupUser[];
    createdBy:string;
    createdDate:Moment.moment;
    lastModifiedBy:string;
    lastModifiedDate:Moment.moment;
}



interface GroupCreate{
    id?:number;
    name:string;
    description?:string;
    isDeleted?:boolean;
    userList?:List<string>
}


interface GroupSearchParam{
    searchValue?:string;
}

interface UserDTO {
    userName: string;
    id: number;
    key: string;
}

interface GroupUser{

    id:number;
    groupId:number;
    userName:string;
    createdDate:Moment.moment;
    createdBy:string;
    lastModifiedBy:string;
    lastModifiedDate:Moment.moment;

}