import { ProCard } from "@ant-design/pro-components"

interface Props{}
export default({}:Props)=>{

    return (<> <ProCard title="INSTRUCTION" 
        collapsible  
        size="small"
        bordered headerBordered 
    >                  
      <div >• Information in this form and process is Private and Confidential.</div>
      <div >• Probation evaluation is to be conducted at least 2 weeks before probation ends.</div>
      <div >• Results of probation evaluation determine the status of employment as follows:</div>
        <div style={{paddingLeft:15}}> 1)	Probation Passed: Employment is continued. </div>
        <div style={{paddingLeft:15}}> 2)	Probation Failed: Employment is terminated.</div>
        <div style={{paddingLeft:15}}> 3)	Probation Extended: Employment is to be reconfirmed after new probation ends.</div>
      <div >• Probation performance shall be appraised by Function Manager. Employee shall be provided with opportunity to clarify and discuss the results of their probation.</div>          
    </ProCard>    
    </>)

}