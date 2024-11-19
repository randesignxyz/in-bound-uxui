import { ProCard } from "@ant-design/pro-components"

interface Props{}
export default({}:Props)=>{

    return (<> <ProCard title="INSTRUCTION" 
        collapsible  
        size="small"
        bordered headerBordered 
    >                  
      <div >• Information in this form and process is private and confidential.</div>
      <div >• Line Manager must set realistic performance expectations and communicate these expectations clearly to employee at the start of the probation.</div>
      <div >• Probation evaluation is to be conducted at least 2 weeks before probation ends.</div>
      <div >• Probation evaluation will determine the employment status of the employee as follows:</div>
        <div style={{paddingLeft:15}}> 1- Regular employee if the probation performance is satisfied. </div>
        <div style={{paddingLeft:15}}> 2- Terminated employee if the probation performance is unsatisfied.</div>
        <div style={{paddingLeft:15}}> 3- Re-assessed employee if the probation is extended. </div>
      <div >• Probation confirmation does not link or tight to change or adjustment in benefits</div>
      <div >• Probation evaluation is appraised by Line Manager. Employee will be provided with opportunity to discuss and seek clarification over the results.</div>                  
    </ProCard>    
    </>)

}