import { ProCard } from "@ant-design/pro-components"

interface Props{}
export default({}:Props)=>{

    return (<> <ProCard title="Remarks" 
        collapsible ={false}  
        size="small"
        headerBordered 
    >                  
      <div>- This form shall be prepared by Sales Executive on the customer's behalf.</div>
      <div>- All required documents shall be photo-copied and attached to this form.</div>
      <div>- This form is to be submitted for review by all concerned managers and approved based on LoA.</div>
      <div>- Original copy of the form and supporting documents are to be kept by Finance Funtion.</div>
      <div>- A copy of the form and supporting documents are to be archieved by Sales Function.</div>       
    </ProCard>    
    </>)

}