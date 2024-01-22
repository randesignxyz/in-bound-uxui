export interface ContactDetail {
    id?: number;
    internalName: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    jobTitle?: string;
    remarks?: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    email?: string;
    createdBy?: string;
    createdDate?: moment.Moment;
    lastModifiedBy?: string;
    lastModifiedDate?: moment.Moment;
}

export interface ContactListItem {
    id: number;
    internalName: string;
    key?: string;
    name?: string;
    jobTitle?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    email?: string;
    remarks?: string;
    createdBy?: string;
    createdDate?: moment.Moment;
    lastModifiedBy?: string;
    lastModifiedDate?: moment.Moment;
    defaultContact?: boolean;

    
}

export interface ContactData {
    id?: number;
    internalName: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    genderId?: number;
    jobTitle?: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    email?: string;
    remarks?: string;
}

export interface ContactDetail {
    id?: number;
    internalName: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    genderId?: number;
    jobTitle?: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    email?: string;
    remarks?: string;
    activities?: string[];
}