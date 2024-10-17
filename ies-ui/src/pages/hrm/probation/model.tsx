import { BaseActionType, baseReducer, commmonActions, StateType } from "@/services/model";
import { useReducer } from "react"
import {AppraisalEmp, AppraisalEmPayload, AppraisalEmpImprovement, AppraisalEmpStatus, AppraisalEmpStatusChecking, AppraisalEmpSubmissionResult, AppraisalEmSubmissionPayLoad, AppraisalRating, AppraisalRemark, ValidatorMsg} from "./data.types";
export type ModalName = 'CreateAppraisalForm'|'QuickViewAppraisalForm'|'SubmitAllListView' |'ReviewMemberForm' | 'CreateProbationForm' |undefined

export interface InitData { id?:number }

interface State extends StateType<ModalName> {
    loading: boolean;
    initialData?: InitData;
}
type Action =
    BaseActionType<ModalName>
    | { type: 'initData', payload: InitData }

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'initData': return { ...state, initialData: { ...state.initialData, ...action.payload } }
       
        default:
            return baseReducer(state, action);
    }
}

export const Model = () => {
    const initState: State = {
        loading: false,
    }
    const [state, dispatch] = useReducer(reducer, initState)
    //Commons fun
    const actions = commmonActions(dispatch, state)
    
    const setAppraisalRating=(it:AppraisalEmpSubmissionResult,status:string,appraisalDimensionId: number,appraisalBehaviorId:number,rating:number): AppraisalEmpSubmissionResult=>{
        
        if (it.appraisalDimensionId==appraisalDimensionId && it.appraisalBehaviorId==appraisalBehaviorId){
                if(status=='r1'){
                    return {...it,rating1:rating}
                }else if(status=='r2'){
                    return {...it,rating2:rating}
                }else if(status=='r3'){
                    return {...it,rating3:rating}
                }else if(status=='r4'){
                    return {...it,rating2:rating}
                }else{
                    return {...it,rating5:rating}
                }                   
        }else if(it.appraisalDimensionId==appraisalDimensionId && it.appraisalBehaviorId!=appraisalBehaviorId){
            if(status=='r1'){
                return {...it,rating1:0}
            }else if(status=='r2'){
                return {...it,rating2:0}
            }else if(status=='r3'){
                return {...it,rating3:0}
            }else if(status=='r4'){
                return {...it,rating4:0}
            }else{
                return {...it,rating5:0}
            }                   
            }else{
                return it
            }
    }
    const getStatus =(actionStatus:string,r?:AppraisalEmp):AppraisalEmpStatusChecking=> {        
        const currentAssign1 = (r?.currentAssign1||false)
        const currentAssign2 = r?.currentAssign2||false
        const currentAssign3 = r?.currentAssign3||false
        const hasRating2 = r?.hasRating2||false
        var rated1 = r?.rated1||false
        var rated2 = r?.rated2||false
        var rated3 = r?.rated3||false
        var status ='SUBMITTED'    
        var checkRating = 'rating1'
        actionStatus=actionStatus=='DRAFTED'?'DRAFTED':''
        if(currentAssign1){
            status =actionStatus=='DRAFTED'?'SUBMITTING':status
            checkRating = 'r1'
        }else if(hasRating2 && (rated1 && currentAssign2)){
            status = actionStatus=='DRAFTED'?'SUBMITTED':'REVIEWED'
            rated2 = true
            checkRating = 'r2'
        }else if(!hasRating2 && (rated1 && currentAssign3)){
            status = actionStatus=='DRAFTED'?'SUBMITTED':'COMPLETED' 
            rated3 = true
            checkRating = 'r3'
        }else if(rated2 && currentAssign3){
            status = actionStatus=='DRAFTED'?'REVIEWED':'COMPLETED'
            rated3=true
            checkRating = 'r3'
        }   
        return {status,actionStatus,checkRating,rated1,rated2,rated3} as AppraisalEmpStatusChecking
    }
    const getValidationMsgList=(r:AppraisalEmp): ValidatorMsg[]=>{
        var validtor = Array<ValidatorMsg>()
        var myIdentity =  r.currentAssign1?'My ':'His/Her '
        if(r.currentAssign3){
            var size3 = r.appraisalEmpSubmissionList?.filter((i:any)=> (i?.rating3||0)==0).length||0
            if(size3>0){
                validtor.push({
                    id: r.id,
                    title:'Agreed Rating',
                    msg:'is required'
                })
            }
            if(!r.rating3Comment || r.rating3Comment==''){
                validtor.push({
                    id: r.id,
                    title:'Agreed Rating’s COMMENTS',
                    msg:'is required'
                })
            }
            if(!r?.hasRating2 && (r?.appraisalEmpImprovementRated3List||[]).length==0||(r?.appraisalEmpImprovementRated3List?.filter((it:any)=> (!it.improvement || it.improvement==''))||[]).length>0){
                validtor.push({
                    id: r.id,
                    title:`${myIdentity} Area Improvement`,
                    msg:'is required'
                })
            }
            if(!r?.hasRating2 &&(r?.appraisalEmpImprovementRated3List||[]).length==0 ||(r.appraisalEmpImprovementRated3List?.filter((it:any)=> (it.propose==null||it.propose==''))||[]).length>0){
                validtor.push({
                    id: r.id,
                    title:`${myIdentity}  Propose Improvement Actions`,
                    msg:'is required'
                })
            }
        }
        if(r.currentAssign2){
            var size2 = r.appraisalEmpSubmissionList?.filter((i:any)=> (i?.rating2||0)==0).length||0
            if(size2>0){
                validtor.push({
                    id: r.id,
                    title:`FM's Rating`,
                    msg:'is required'
                })
            }
            if((!r.rating2Comment || r.rating2Comment=='') ){
                validtor.push({
                    id: r.id,
                    title:`FUNCTION MANAGER’S COMMENTS`,
                    msg:'is required'
                })
            }
            if((r?.appraisalEmpImprovementRated2List||[]).length==0||(r?.appraisalEmpImprovementRated2List?.filter((it:any)=> (!it.improvement || it.improvement==''))||[]).length>0){
                validtor.push({
                    id: r.id,
                    title:`${myIdentity}Area Improvement`,
                    msg:'is required'
                })
            }
            if((r?.appraisalEmpImprovementRated2List||[]).length==0 ||(r.appraisalEmpImprovementRated2List?.filter((it:any)=> (it.propose==null||it.propose==''))||[]).length>0){
                validtor.push({
                    id: r.id,
                    title:`${myIdentity}Propose Improvement Actions1`,
                    msg:'is required'
                })
            }
        }
        if(r.currentAssign1){
            var size1 = r.appraisalEmpSubmissionList?.filter((i:any)=> (i?.rating1||0)==0).length||0
            if(size1>0){
                validtor.push({
                    id: r.id,
                    title:'Self-Rating',
                    msg:'is required'
                })
            }
            if(!r.empComment || r.empComment==''){
                validtor.push({
                    id: r.id,
                    title:'EMPLOYEE’S COMMENTS',
                    msg:'is required'
                })
            }
            if((r?.appraisalEmpImprovementRated1List||[]).length==0||(r?.appraisalEmpImprovementRated1List?.filter((it:any)=> (!it.improvement || it.improvement==''))||[]).length>0){
                validtor.push({
                    id: r.id,
                    title:`${myIdentity}  Area Improvement`,
                    msg:'is required'
                })
            }
            // console.log('r.appraisalEmpImprovementRated1List111',(r?.appraisalEmpImprovementRated1List||[]).length==0)
            if((r?.appraisalEmpImprovementRated1List||[]).length==0 ||(r.appraisalEmpImprovementRated1List?.filter((it:any)=> (it.propose==null||it.propose==''))||[]).length>0){
                validtor.push({
                    id: r.id,
                    title:`${myIdentity}  Propose Improvement Actions`,
                    msg:'is required'
                })
            }
        }
        return validtor
    }
    const getAppraisalRatingValidation=(lang:string,appraisalList: AppraisalEmpSubmissionResult[]): AppraisalRating[]=>{
        var validatorList = Array<AppraisalRating>()
        appraisalList?.forEach(it=>{
            if(validatorList?.find(i=> i.appraisalDimensionId==it.appraisalDimensionId)){                        
                validatorList=validatorList.map(i => {
                    var i = Object.assign({}, i);
                    if(i.appraisalDimensionId==it.appraisalDimensionId && it?.rating1){
                        i.rating1 = it?.rating1
                    }
                    if(i.appraisalDimensionId==it.appraisalDimensionId && it?.rating2){
                        i.rating2 = it?.rating2
                    }
                    if(i.appraisalDimensionId==it.appraisalDimensionId && it?.rating3){
                        i.rating3 = it?.rating3
                    }
                    if(i.appraisalDimensionId==it.appraisalDimensionId && it?.rating4){
                        i.rating4 = it?.rating4
                    }
                    if(i.appraisalDimensionId==it.appraisalDimensionId && it?.rating5){
                        i.rating5 = it?.rating5
                    }
                    return i
                })
            }else{
                validatorList.push({
                    id:it.appraisalEmpSubmissionId,
                    appraisalDimensionId: it.appraisalDimensionId,
                    title: lang=='KH'? it.title1: it.title,
                    rating1:it?.rating1,
                    rating2:it?.rating2,
                    rating3:it?.rating3,
                    rating4:it?.rating3,
                    rating5:it?.rating5
                } as AppraisalRating)
            }
            return
        }) 
        return validatorList
    }

    const getAppraisalFormPayload=(
            statusCheck: AppraisalEmpStatusChecking,
            dataDetail?: AppraisalEmp,
            dataForm?: AppraisalRemark,
            appraisalRatings?: AppraisalRating[],
            appraisal?:AppraisalEmpSubmissionResult[],
            improvementRated1Updated?: false | boolean,
            improvementRated1List?: AppraisalEmpImprovement[],
            improvementRated2Updated?: false | boolean,
            improvementRated2List?: AppraisalEmpImprovement[],
            improvementRated3Updated?: false | boolean,
            improvementRated3List?: AppraisalEmpImprovement[],
            attachedUpdated?:boolean,
            attachedFiles?: string[]
        ):AppraisalEmPayload=>{

        var submissionList = appraisalRatings?.map(it => {
            var appraisalBehavior = appraisal?.filter(i=> i.appraisalDimensionId==it.appraisalDimensionId).map(ii=> ii.appraisalBehaviorId) || []
            return  ({
                id: it.id,
                appraisalDimensionId: it.appraisalDimensionId,
                appraisalBehavior: appraisalBehavior,
                rating1: it.rating1,
                rating2: it.rating2,
                rating3: it.rating3,
                rating4: it.rating4,
                rating5: it.rating5
             } as AppraisalEmSubmissionPayLoad)
         })
         var empPayload = {
             id: dataDetail?.id,
             empId: dataDetail?.empId,
             empEmail: dataDetail?.empEmail,
             submissionList: submissionList,
             rating2Comment: dataForm?.rating2Comment,
             rating2Comment1: dataForm?.rating2Comment1,
             rating3Comment:dataForm?.rating3Comment,
             rating4Comment:dataForm?.rating4Comment,
             rating5Comment:dataForm?.rating5Comment,
             empComment: dataForm?.empComment,
             empStrength:dataForm?.empStrength,
             empTrainingNeeded: dataForm?.empTrainingNeeded,
             status: statusCheck.status,
             actionStatus: statusCheck.actionStatus,
             rated1: statusCheck.rated1,
             rated2: statusCheck.rated2,
             rated3: statusCheck.rated3,
             rated4:  statusCheck.rated4,
             rated5:  statusCheck.rated5,
             improvementRated1Updated: improvementRated1Updated,
             improvementRated1List: improvementRated1List,            
             improvementRated2Updated: improvementRated2Updated,
             improvementRated2List: improvementRated2List,
             improvementRated3Updated: improvementRated3Updated,
             improvementRated3List: improvementRated3List,
             attachedUpdated:attachedUpdated,
             attachedFiles: attachedFiles
         } as AppraisalEmPayload
        return empPayload
    }
    
    const appraisalFormDataValidator=(
        lang:string,
        hasRating2:boolean,
        currentAssign1:boolean,
        currentAssign2:boolean,
        currentAssign3:boolean,
        dataForm: AppraisalRemark,
        appraisalList: AppraisalEmpSubmissionResult[],
        improvementRated1List?: (AppraisalEmpImprovement & {key:string})[],
        improvementRated2List?: (AppraisalEmpImprovement & {key:string})[],
        improvementRated3List?: (AppraisalEmpImprovement & {key:string})[],
        onValidation?:(requireFields:ValidatorMsg[],requireRating:AppraisalRating[]
    )=>void) =>{
        var requireFields = Array<ValidatorMsg>()
        // var myIdentity =  currentAssign1?'My ':'His/Her '
        var areaImprovementMsgCode = currentAssign1?'TITLE_EMP_EM_MY_AREA_IMPROVEMENT':'TITLE_EMP_EM_HIS_AREA_IMPROVEMENT'
        var improvementActionMsgCode = currentAssign1?'TITLE_EMP_EM_MY_IMPROVEMENT_ACTION':'TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION'
        var requireMsgCode = 'MSG_IS_REQUIRED'
        if(!dataForm?.empComment && currentAssign1){
            requireFields.push({id:0,title:'TITLE_EMP_COMMENT',msg:requireMsgCode})
        }
        if(((improvementRated1List?.length==0)||(improvementRated1List?.filter(it=>(!it.improvement||it.improvement==''))||[]).length>0) && currentAssign1){
           
            requireFields.push({id:0,title:areaImprovementMsgCode,msg:requireMsgCode})
        }  
        if(((improvementRated1List?.length==0)||(improvementRated1List?.filter(it=>(!it.propose || it.propose==''))||[]).length>0) && currentAssign1){
           
            requireFields.push({id:0,title:improvementActionMsgCode,msg:requireMsgCode})
        }                  
       
        if(((!dataForm?.rating2Comment || dataForm.rating2Comment==''))&& currentAssign2){           
            requireFields.push({id:0,title:`TITLE_FM_COMMENT`,msg:requireMsgCode})
        }
        if(((improvementRated2List?.length==0)||(improvementRated2List?.filter(it=>(!it.improvement||it.improvement==''))||[]).length>0)&& currentAssign2){
           
            requireFields.push({id:0,title: areaImprovementMsgCode,msg:requireMsgCode})
        }  
        if(((improvementRated2List?.length==0)||(improvementRated2List?.filter(it=>(!it.propose || it.propose==''))||[]).length>0)&& currentAssign2){
           
            requireFields.push({id:0,title: improvementActionMsgCode,msg:requireMsgCode})
        }  
        
        if(((!dataForm?.rating3Comment || dataForm.rating3Comment==''))&& currentAssign3){           
            requireFields.push({id:0,title: `TITLE_AGREED_COMMENT`,msg:requireMsgCode})
        }
        if(((improvementRated3List?.length==0)||(improvementRated3List?.filter(it=>(!it.improvement||it.improvement==''))||[]).length>0)&& currentAssign3 && !hasRating2){
           
            requireFields.push({id:0,title: areaImprovementMsgCode,msg:requireMsgCode})
        }  
        if(((improvementRated3List?.length==0)||(improvementRated3List?.filter(it=>(!it.propose || it.propose==''))||[]).length>0)&& currentAssign3 && !hasRating2){
           
            requireFields.push({id:0,title: improvementActionMsgCode,msg:requireMsgCode})
        }  
        onValidation?.(requireFields, getAppraisalRatingValidation(lang,appraisalList))
    }

    const getLangauge=(lang:string): any=>{
        return lang=='KH'?'ENG':'KH'
    }

    return {       
        state: state,   
        data: {
            setAppraisalRating: setAppraisalRating,
            validationMsgList: getValidationMsgList,
            appraisalRatingValidation: getAppraisalRatingValidation,
            appraisalFormPayload: getAppraisalFormPayload,
            onAppraisalFormDataValidator: appraisalFormDataValidator
        },  
        actions: {
            getStatus:getStatus,
            getLangauge: getLangauge
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        }
    }

}
