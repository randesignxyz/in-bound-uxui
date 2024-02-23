import { List } from "lodash";
import { Moment } from "moment";


interface TeamsDTO{
    id:number;
    name:string;
    description:string,
    isDeleted:boolean;
    memberList:GroupUser[];
    createdBy:string;
    createdDate:Moment.moment;
    lastModifiedBy:string;
    lastModifiedDate:Moment.moment;
}



interface TeamsCreate{
    id?:number;
    name:string;
    description?:string;
    isDeleted?:boolean;
    memberList?:List<string>
}


interface TeamsSearchParam{
    isCurrentUser?:boolean;
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