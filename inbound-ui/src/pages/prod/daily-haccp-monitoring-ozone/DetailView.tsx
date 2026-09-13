import { formatDate, formatDateTime } from '@/pages/utils';
import { ProCard, ProForm, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Badge, Card, Col, Descriptions, Divider, Modal, Row, Space, Spin, Tabs, Typography, message } from 'antd';
import moment from 'moment';
// import { DailyPreWaterTreatment, DailyPreWaterTreatmentList } from './data';
import { ProdPaths } from '..';
import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { useLocation } from 'umi';
import { simpleRequestActions } from '@/services/model';
import { useEffect, useState } from 'react';
import DescriptionDisplay from '@/components/Descriptions';
import { HACCPMonitoringOzoneServiceAPI } from './service';
import { HACCPMonitoringOzone } from './data';
import ItemTab from './ItemTab';
import ActivitiesTab from './ActivitiesTab';
// import ItemTab from './ItemTab';
// import ActivitiesTab from './ActivitiesTab';

interface Props extends DrawerFormProps {
    id: string;
    //   reload?: (id: number) => Promise<void>;
    //   onEdit?: () => void;
    //   onAdd?: () => void;
}

export default ({ id, ...rest }: Props) => {
    const { Text } = Typography;
    const requestActions = simpleRequestActions();
    const services = HACCPMonitoringOzoneServiceAPI(requestActions);
    const [data, setData] = useState<HACCPMonitoringOzone>()
    const [pressureModelOpen, setPressureModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [onRefresh, setOnRefresh] = useState(false)
    const part = id.split("/");
    const routes = [
        {
            path: ProdPaths.prod,
            label: 'Prod',
        },
        {
            path: `${ProdPaths.dailyHACCPMonitoringtOzone}/list`,
            label: 'HACCP Monitoring Ozone',
        },
        {
            path: '',
            label: 'Deatil',
        },
    ];

    useEffect(() => {
       
        const data = async () => {
            const da = await services.getOzoneByDateTime(part[0], part[2], part[1])
            setData(da[0])
        }
        data()
        setOnRefresh(false)
    }, [id,onRefresh==true])

    const formatDate = (dateString:any) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    return (
        <>
            <BreadCrumbCom separator=">" routes={routes} />
            <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 20 }}>
                <Space >
                    <ProForm submitter={false}>
                        <DescriptionDisplay
                            data={[
                                { label: 'Assign Date', value: formatDate(data?.assign_date) },
                                { label: 'Time', value: data?.time },
                                { label: 'Assign To', value: data?.assign_to },
                                { label: 'Type', value: data?.haccp_ozone_type },
                                { label: 'Created By', value: data?.createdBy },
                                { label: 'Created Date', value: formatDateTime(data?.createdDate) },
                                { label: 'Remark', value: data?.remark ? data?.remark : '-'},
                                // { label: 'Assign To', value: data?.assign_to },
                                // { label: 'Treatment Type', value: data?.pre_treatment_type },
                            ]}
                        />
                    </ProForm>
                </Space>
            </Card>
            <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 20 }}>
            <Tabs
            items={[
              {
                label: 'List',
                key: '1',
                children: <ItemTab data={data ?? {}} type={part[2]} refresh={(v) => { v == true ? setOnRefresh(true) : setOnRefresh(false) }} />,
              },
              {
                label: 'Activities',
                key: '2',
                children: <ActivitiesTab data={data?.haccp_ozone_id ?? ''}/>,
              },
            ]}
          />
            </Card>
        </>
    );
};
