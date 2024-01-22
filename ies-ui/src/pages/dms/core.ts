import moment from "moment"
import { Moment } from "moment"

export const formateBytes = (bytes:number, decimals:number )=>{
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const formateFileType =(fileType?:string) =>{
    if (fileType ==="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
        return "EXCEL"
    }
    else if(fileType ==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
        return "WORD"
    }
    else if (fileType ==='image/png'){
        return "PNG"
    }
    else if (fileType ==='application/pdf'){
        return "PDF"
    }
    else if (fileType ==='image/jpg'){
        return "JPG"
    }
}



export const convertDuration =(momentDate?:Moment)=>{

    
    if (momentDate!=null){
            const dateNum= moment().diff(momentDate, "hours")
            return moment(momentDate).fromNow()
    

    }else{
        return "-"
    }

}

export const convertDurationEx = (diff:Moment) =>{
    const diffNumber=moment(diff).unix()
    const p = moment.duration(diffNumber);
    const day = p.days() > 0 ? `${p.days()}d` : undefined;
    const hour = p.hours() > 0 ? `${p.hours()}h` : undefined;
    const minute = p.minutes() > 0 ? `${p.minutes()}m` : undefined;
    const second = p.seconds() > 0 ? `${p.seconds()}s` : undefined;
    const millisecond = p.milliseconds() > 0 ? '1s' : undefined;

    return `${day ?? ''} ${hour ?? ''} ${minute ?? ''} ${second ?? millisecond ?? ''}`.trim();
}


// ======== reminder =========

 export const checkReminder = ( reminderDate:Moment, period?:number )=>{
    const peroidDate = moment(reminderDate).subtract(period||0,"days");
    const currentDay = moment().diff(peroidDate,"days");
    
    return currentDay
    
}



export const expriationStatus = (reminderDate:Moment)=>{
    const currentDay = moment().diff(reminderDate,"hours");
    
    return currentDay
}