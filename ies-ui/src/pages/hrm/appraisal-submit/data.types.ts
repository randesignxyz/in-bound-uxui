import moment, { Moment } from "moment"

export class AppraisalStyle {
    static color1:string = '#52c41a21'
    static color2:string = '#c2af1f12'
    static color3:string = '#0000001a'
}

export type AppraisalEmp = {
    id: number
    empId: number
    empNo: string    
    empName: string
    internalName:string
    empEmail:string
    endBuId:number
    empBuName:string
    departmentName:string
    subDepartmentName?:string
    appraisalPerformanceId:number
    appraisalDate: Moment
    buName?: string
    reportTo?:string
    jobTitle?: string
    createdBy: string
    createdDate: Moment
    modifiedDate?:Moment
    modifiedBy?: string
    title?: string
    startedDate?: Moment
    endedDate?: Moment
    rating1: number
    rating2?: number
    rating3?: number
    rating4?: number
    rating5?: number
    hasRating2: boolean
    currentAssign1:boolean
    currentAssign2:boolean
    currentAssign3:boolean
    currentDrafted:boolean
    rated1:boolean
    rated2:boolean
    rated3:boolean
    rated4:boolean
    rated5:boolean
    status:string
    actionStatus?:string
    itemStatus?:string
    appraisalRequestItemId?:number
    rating2Comment?:string
    rating2Comment1?:string
    rating3Comment?:string
    rating4Comment?:string
    rating5Comment?:string
    empComment?:string
    empTrainingNeeded?:string
    empStrength?:string
    requestStatus?:string
    attachedFiles?:string[]
    appraisalEmpSubmissionList?: AppraisalEmpSubmission[]
    appraisalEmpImprovementRated1List?: AppraisalEmpImprovement[]
    appraisalEmpImprovementRated2List?: AppraisalEmpImprovement[] 
    appraisalEmpImprovementRated3List?: AppraisalEmpImprovement[]   
    appraisalRequestItem?:{
        personalAction?: string
        devAction?: number  
        remark?: string
    }
}

export type AppraisalEmpSubmission={
    id: number
    appraisalEmpId: number
    appraisalDimensionId: number
    rating1: number
    rating2?: number
    rating3?: number
    rating4?: number
    rating5?: number
}

export type SearchParams = {
    keyword?: string
    status?: string
}

export type RequestedItem = {
    checked: boolean
    itemId: number
    itemName: string
    amount?: number
    selector?: string
    optionGroup?: string
    remarks?: string
}
export type AppraisalPerformance = {
    id: number
    title: string
    frequency: string
    startedDate: Moment
    endtedDate: Moment
    active: number
}

export type CurrentAppraisalEmpSearch = {
    id: number
    empId: number
    empNo: string
    empName: string
}

export type RequestItem = {
    itemId: number
    itemName: string
    itemType?: string
    qty?: number
    amount?: number
    remarks?: string
}

export type AppraisalEmpSubmissionResult = {
    id: number
    appraisalEmpSubmissionId: number
    appraisalDimensionId: number
    title: string
    description: string
    title1?: string
    description1?: string
    weight:number
    rating1: number
    rating2: number
    rating3: number
    rating4: number
    rating5: number    
    appraisalBehaviorId: number
    behaviorDescription: string
    behaviorDescription1?: string
    behaviorRate: number
    sort:string
    gsort: number
    gtotal: number
    attachedFiles?: string[]
}
export type AppraisalRating = {
    id: number
    appraisalDimensionId: number
    title?: string
    title1?: string
    rating1?: number
    rating2?: number
    rating3?: number
    rating4?: number
    rating5?: number 
    weight: number 
}
export type AppraisalDimension = {
    id: number
    title: string
    description: string
    rating1?: number
    items: AppraisalBehavior[]
}
export type AppraisalBehavior = {
    id: number
    rate:number
    description: string
}
export type AppraisalEmSubmissionPayLoad = {
    id: number
    appraisalDimensionId: number
    appraisalBehavior: number[]
    rating1: number
    rating2: number
    rating3: number
    rating4: number
    rating5: number
    weight:number
}
export type AppraisalEmPayload = {
    id: number
    empId?: number
    empEmail?:string
    submissionList: AppraisalRating[]
    improvementRated1Updated?:boolean
    improvementRated1List?: AppraisalEmpImprovement[]
    improvementRated2Updated?:boolean
    improvementRated2List?: AppraisalEmpImprovement[]
    rating2Comment?: string
    rating2Comment1?: string
    rating3Comment?: string
    rating4Comment?: string
    rating5Comment?: string
    empComment?: string
    empStrength?: string
    empTrainingNeeded?: string
    attachedUpdated?:boolean
    attachedFiles?: string[]
    status:string
    actionStatus?:string
    rated1:boolean
    rated2:boolean
    rated3:boolean
    rated4:boolean
    rated5:boolean
}
export type AppraisalEmpStatusChecking = {
    status:string
    actionStatus:string
    checkRating:string
    rated1:boolean
    rated2:boolean
    rated3:boolean
    rated4:boolean
    rated5:boolean
}
export type UpdateAppraisalEmPayload = {
    id: number    
    remark?:string
}

export type AppraisalRemark = {    
    rating2Comment?: string
    rating2Comment1?: string
    rating3Comment?: string
    rating4Comment?: string
    rating5Comment?: string
    empComment?: string
    empStrength?: string
    empTrainingNeeded?: string
}
export type AppraisalAttachmentFile = {    
    id: number
    fileId: string
}
export type AppraisalEmpStatusTotal = {
    all: number
    pending?: number
    completed?:number
    drafted?:number
    accessRequest:boolean
}

export type AppraisalEmpStatus = {
    drafted: boolean
    isDrafted: boolean
    submitted:boolean
    reviewed: boolean
    currentAssign1:boolean
    currentAssign2:boolean
    currentAssign3:boolean
    hasRating2:boolean
}
export type AppraisalEmpSubmitAllPayload ={
    id:number
    status:string
    actionStatus?:string
    rated1:boolean
    rated2:boolean
    rated3:boolean
    rated4:boolean
    rated5:boolean
}
export type ValidatorMsg = {
    id:number
    title:string
    msg:string
}
export type AppraisalOverallPerformanceRating = {
    id: number
    appraisalPerformaceId: number
    decription:string
    decription1?:string
    startedScore: number
    endedScrore: number
    rating: number
}
/**
 * refCode: r1,r2,r3,r4,r5
 */
export type AppraisalEmpImprovement ={
    id:number
    appraisalEmpId: number
    improvement: string
    propose: string
    refCode: string
}

export type AppraisalMapping = {
    id: number
    empNo: string
    empName: string
    appraiser1Id?: number
    appraiser2Id?: number
}
export type EmployeeInfResult = {
    empId: number
    empNo: string
    empName: string
    internalName?: string
    empFirstName: string
    empLastName: string
    buId: number
    buName?: string
    departmentId: number
    departmentName: String
    subDepartmentId?: number
    subDepartmentName?: string
    jobId: number
    jobTitle: string
    reportToId?: number
    reportTo?: string
    hodId?: number
    hodName?: string
}
export type AppraisalInstructionItem = {
    id: number
    description: string
    description1: string
    active: boolean
}

export type AppraisalDataLookup = {
    code: string
    value: string
    value1?: string
}