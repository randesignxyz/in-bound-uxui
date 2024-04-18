import moment, { Moment } from "moment";

interface ReminderDTO{
    id:number;
    documentId:number;
    title:string;
    reminderDate:moment.Moment;
    type:string;
    period:number;
    command:string;
    createdby?:string;
    createdDate?:Moment.moment;
}
interface ReminderCreate{
    id?:number;
    documentId?:number;
    title:string;
    reminderDate:moment.Moment;
    type:string;
    period:number;
    command:string
}
interface ReminderAdvanceSearchParam{
    
}