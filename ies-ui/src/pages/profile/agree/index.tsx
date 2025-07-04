import { PageContainer, ProCard} from "@ant-design/pro-components"
import { useParams } from "@umijs/max"
import { Button, Checkbox, Col, Flex, Layout, message, Modal, Row} from "antd"
import { Content } from "antd/es/layout/layout"
import { useEffect, useState } from "react"
import { history } from "@umijs/max"
import { simpleRequestActions } from "@/services/model"
import { ProfileServices } from '../service'
import { ProfileData } from "../data"
import { ProfileServicesEss } from "../service_ess"

export default() => {
    const params = useParams();
    const requestActions = simpleRequestActions();
    const {id} = params;
    const [confirm,setConfirm] = useState(false)
    const [profile, setProfile] = useState<ProfileData>();
    const handleCheckboxChange = (value: any) => {        
        setConfirm(!confirm)
    };
    useEffect(() => {
      initData();
    }, []);
    const initData = async () => {
      try {
          const rs = await ProfileServices.fetchProfile(Number(id)).query(requestActions);
          setProfile(rs);    
      } catch (error: any) {
        message.error(error.message || 'Failed to load data.')
      } 
    }

    const onStartModify = ()=>{ 
      console.log({...profile?.profile, empId: profile?.id,step:2,openEssId:profile?.ess.id,otherFile:[],remark:'',status:true})
      Modal.confirm({
        title: 'Start Modify Data',
        content: 'Do you want to modify the data?',
        onOk: async () => {
          try {  
              await ProfileServicesEss.saveEssProfile({...profile?.profile, empId: profile?.id||0,step:2,openEssId:profile?.ess.id,otherFile:[],remark:'',status:true})(requestActions);           
              history.push(`/profile/0/0`)
          } catch (error: any) {
            message.error(error.message || 'Failed to created.');
          }
        },
      });  
    } 

    return(
      profile  && profile.ess.stepId==0 && <Layout style-mentioned={{ minHeight: '100vh' }}>
          <Content>
            <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
              <Col>
                <PageContainer
                  header={{ title: '' }}
                  style={{ width: '800px' }}
                >
                  <ProCard bordered={true} title={false}>
                    <div style={{ paddingBottom: 16 ,border: 'solid 1px', borderRight:'0px', borderLeft:'0px',borderTop:'0px',borderColor:'#ededed'}}>
                      <h3>Terms and Conditions for Self-Service Module</h3>
                      <div style={{fontSize:'13px'}}>By using the Employee Self-Service Module, you agree to the following terms and conditions.<br/> Please read them carefully before proceeding.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>1. Employee Responsibilities</strong>
                      <div style={{marginLeft: 16}}>• Employees are responsible for ensuring that all the information you provide, including personal details, is accurate, complete, and up to date.</div>
                      <div style={{marginLeft: 16}}>• Providing false or misleading information may result in disciplinary actions.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>2. Use of Personal Information</strong>
                      <div style={{marginLeft: 16}}>• The information you provide will be used solely for legitimate business purposes, including human resources management, payroll processing, and compliance with legal obligations.</div>
                      <div style={{marginLeft: 16}}>• Your personal information will be secured and handled in accordance with our data policy and applicable data protection laws.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>3. Data Privacy and Security</strong>
                      <div style={{marginLeft: 16}}>• The confidentiality and security of your personal information shall be assured by the company. Appropriate measures will be implemented to safeguard the data from unauthorized access or disclosure.</div>
                      <div style={{marginLeft: 16}}>• Access to the data will be restricted and only authorized personnel will have access to the information.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>4. Access and Update</strong>
                      <div style={{marginLeft: 16}}>• You may access and update your profile through this platform within the set period by HRM. It is your responsibility to ensure the information remains accurate and up to date.</div>
                      <div style={{marginLeft: 16}}>• In case of significant changes (e.g., name change, change in national ID or residency status), you must inform HRM personnel to update the information promptly.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>5. Confidentiality</strong>
                      <div style={{marginLeft: 16}}>• Access to confidential employee information is restricted to authorized personnel on a need-to-know basis for legitimate business purposes only. Employees are prohibited from disclosing or sharing this information with unauthorized individuals.</div>
                      <div style={{marginLeft: 16}}>• The company reserves the right to use anonymized and aggregated data for reporting and analysis purposes.</div>
                      <div style={{marginLeft: 16}}>• Any third-party vendors or contractors who have access to employee information must sign confidentiality agreements and adhere to the same level of data protection standards.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>6. Legal Compliance</strong>
                      <div style={{marginLeft: 16}}>• By providing your information, you confirm that you understand and comply with all applicable laws related to personal data and employment records.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>7. Consent</strong>
                      <div style={{marginLeft: 16}}>• By proceeding with the use of this system, you consent to the collection, use, and processing of your personal data as described in these terms and our data policy.</div>
                      <div style={{marginLeft: 16}}>• If you do not agree with any part of these terms, you should refrain from using the system.</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>8. Modifications to Terms</strong>
                      <div style={{marginLeft: 16}}>• The company reserves the right to modify these terms and conditions at any time. You will be notified of any significant changes, and your continued use of the platform implies acceptance of the updated terms.</div>
                    </div>
                    <div style={{ marginTop: 24, paddingTop: 16 ,border: 'solid 1px', borderRight:'0px', borderLeft:'0px',borderBottom:'0px',borderColor:'#ededed'}}>
                        <Checkbox onChange={handleCheckboxChange}> Agree, you confirm that you have read, understood, and accepted these terms and conditions.</Checkbox>                     
                    </div>
                    <Flex justify="flex-end" gap={15} style={{ marginTop: 16 }}>
                      <Button disabled={!confirm} type="primary" onClick={onStartModify}>Ok</Button>
                    </Flex>
                  </ProCard>
                </PageContainer>
              </Col>
            </Row>
          </Content>
      </Layout>
    );
}