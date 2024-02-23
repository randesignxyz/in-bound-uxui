import moment from "moment"
import { Moment } from "moment"
import { Attachment } from "./documentation/data"

export const formateBytes = (bytes: number, decimals: number) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

let fileType: string;
export const formateFileType = (fileAttach?: Attachment[]) => {

    fileAttach?.filter(o => {
        if (o.fileExtension == "pdf") {
            fileType = "PDF"
        }
        else if (o.fileExtension == "docx") {
            fileType = "WORD"
        }
        else if (o.fileExtension == "xlsx" || "xlx") {
            fileType = "EXCEL"
        }
        else {
            fileType = "IMAGE"
        }

    });

    return fileType
}



export const convertDuration = (momentDate?: Moment) => {


    if (momentDate != null) {
        const dateNum = moment().diff(momentDate, "hours")
        return moment(momentDate).fromNow()


    } else {
        return "-"
    }

}

export const convertDurationEx = (diff: Moment) => {
    const diffNumber = moment(diff).unix()
    const p = moment.duration(diffNumber);
    const day = p.days() > 0 ? `${p.days()}d` : undefined;
    const hour = p.hours() > 0 ? `${p.hours()}h` : undefined;
    const minute = p.minutes() > 0 ? `${p.minutes()}m` : undefined;
    const second = p.seconds() > 0 ? `${p.seconds()}s` : undefined;
    const millisecond = p.milliseconds() > 0 ? '1s' : undefined;

    return `${day ?? ''} ${hour ?? ''} ${minute ?? ''} ${second ?? millisecond ?? ''}`.trim();
}


// ======== reminder =========

export const checkReminder = (reminderDate: Moment, period?: number) => {
    const peroidDate = moment(reminderDate).subtract(period || 0, "days");
    const currentDay = moment().diff(peroidDate, "days");

    return currentDay

}



export const expriationStatus = (reminderDate: Moment) => {
    const currentDay = moment().diff(reminderDate, "hours");
    // console.log(currentDay);
    
    return currentDay
}


export const getFileTypeviaExtension = (fileName?: string) => {
    const extension = getFileExtension(fileName);
    return extension
}
function getFileExtension(filename?: string): string {
    return filename?.split('.').pop() || ''; // Get the last part after the last dot
}

export const shareStatus = (date?: Moment): { status: "processing" | "warning"|"error"; title: string } => {


    const days = moment(date).diff(moment(), "days");
    if (date) {
        if (days > 2) {
            return {
                status: "processing",
                title: "active"
            }
        }
        else {
            return {
                status: "error",
                title: "expire soon"
            }
        }
    }
    else{
        return {
            status: "processing",
            title: "no Expire"
        }
    }


}

export const status = (date?: Moment): { status: "processing" | "warning"|"error"; title: string } => {
    const days = moment(date).diff(moment(), "hours");
    // console.log(moment().diff(moment(date),"days"));
    // console.log(days);
    
    
    if (date) {
        if (days > 2) {
            return {
                status: "processing",
                title: "active"
            }
        }
        else if(days <2 && days >0 ){
            return {
                status: "warning",
                title: "expire soon"
            }
        }
        else {
            return {
                status: "error",
                title: "expired"
            }
        }
    }
    else{
        return {
            status: "processing",
            title: "no Expire"
        }
    }
}