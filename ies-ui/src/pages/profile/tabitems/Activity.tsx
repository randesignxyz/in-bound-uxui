
import { ProTable } from "@ant-design/pro-components"  
import { message, Space,Card, Tag } from 'antd';
import { useEffect,useState } from 'react';
import { ProfileData} from '../data';
import { ActivityData } from "../data.ess"; 
import { ProfileServicesEss } from '../service_ess'; 
import { simpleRequestActions } from '@/services/model'; 
import { formatDateTime } from "@/pages/utils";


interface Props {
    profile: ProfileData;
    step: any;
    is_admin:number;
  }

export default ({ profile ,step,is_admin}: Props) => { 
    const requestActions = simpleRequestActions();
    const [activityList, setActivityList] = useState<ActivityData[]>([]);
     

    useEffect(() => {
        initData();
    }, []);
    const initData = async () => {
        try {
            const list = await ProfileServicesEss.listActivityProfile(profile.id).query(requestActions);
            setActivityList(list); 
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
        }
    }; 
    const _stag = ["Cancel Updated","Start","Started Modified","Reviewing","Rejected with Revoke","Revoke","Approval","Cancelled Submitted","Activity"]; 
    return <div>
        <Card>
            <Space direction={"vertical"} style={{width:'100%'}}> 
                <ProTable<ActivityData>
                    dataSource={activityList}
                    search={false}
                    pagination={false}
                    size='small'
                    options={{
                        density: false,
                        fullScreen: false,
                        setting: false,
                        reload: false
                    }}
                    columns={[
                        {
                            title: "Description",  
                            dataIndex: "description" 
                        },{
                            title: "Created Date", render: (_, r) => <>{formatDateTime(r.createdDate)}</>  
                        },{
                            title: "Remark", dataIndex: "remark"
                        },
                        {
                            title: "Type", 
                            render: (dom, r) => {  
                                var color = "";
                                if(r.step==7){ color = "magenta"; }
                                else if(r.step==5){ color = "volcano"; }
                                else if(r.step==4){ color = "red"; }
                                else if(r.step==6){ color = "#108ee9"; }
                                return <><Tag color={color}>{_stag[r.step]}</Tag></>
                            }
                        },{
                            title: "Created By", dataIndex: "createdBy"
                        }
                    ]}
                />
            </Space>
        </Card>
         
    </div>
}