import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { ProdPaths } from '..';
import { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import moment from 'moment';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProForm, ProFormSelect, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Card, Col, DatePicker, Flex, Modal, Progress, Row, Space, Tabs, Tag, Tooltip, Typography, message } from 'antd';
import { ArrowRightOutlined, EditOutlined, EllipsisOutlined, FileDoneOutlined, FileExcelOutlined, PlusOutlined, RedoOutlined, SettingOutlined } from '@ant-design/icons';
import { DailyHACCPMonitoringServiceAPI } from './service';
import { HACCPMonitoring } from './data';
import InstructionFormModal from './InstructionFormModal';
import InstructionListTab from './InstructionListTab';

export default () => {
    const access = useAccess();
    const [date, setDate] = useState<Moment>(moment());
    const [modalOpen, setModalOpen] = useState(false)
    const [onRefresh, setOnRefresh] = useState(false)
    const requestActions = simpleRequestActions();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [data, setData] = useState<HACCPMonitoring[]>([])
    const { Text } = Typography;
    const [excelLoading, setExcelLoading] = useState(false)
    const [exportModel, setExportModal] = useState<{ visible: boolean }>({
        visible: false,
    });
    const routes = [
        {
            path: ProdPaths.prod,
            label: 'Prod',
        },
        {
            path: `/prod/daily-haccp-monitoring/list`,
            label: 'Daily HACCP Monitoring Line',
        },
        {
            path: '',
            label: 'Instruction',
        },
    ];

    //   useEffect(() => {
    //     const getData = async () => {
    //       const dateWithoutTime = date?.format("YYYY-MM-DD");
    //       const data = await services.getHaccpByDate(dateWithoutTime)
    //       setData(data)
    //     }
    //     getData()
    //     setOnRefresh(false)
    //   }, [date, onRefresh == true])

    return (
        <>
            <BreadCrumbCom separator=">" routes={routes} />

            <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 10 }}>
                <Space >
                    <Tooltip title="Add new instruction">
                        <Button
                            key="click-add"
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={() => setModalOpen(true)}
                        />
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <Button
                            key="refresh"
                            type="link"
                            icon={<RedoOutlined />}
                            onClick={() => setOnRefresh(true)}
                        />
                    </Tooltip>
                </Space>
            </Card>
            <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 20 }}>
                <Tabs
                    items={[
                        
                        {
                            label: 'Line 2 and 3',
                            key: '1',
                            children: <InstructionListTab group_line='1' refresh={onRefresh} onRefresh={(a)=>{a==true?setOnRefresh(true):setOnRefresh(false)}}/>,
                        },
                        {
                            label: 'Line 4, 5 and 6',
                            key: '2',
                            children: <InstructionListTab group_line='2' refresh={onRefresh} onRefresh={(a)=>{a==true?setOnRefresh(true):setOnRefresh(false)}}/>,                        
                        },
                        {
                            label: 'Line Barrel',
                            key: '3',
                            children: <InstructionListTab group_line='3' refresh={onRefresh} onRefresh={(a)=>{a==true?setOnRefresh(true):setOnRefresh(false)}}/>,
                        },
                    ]}
                />
            </Card>
            <InstructionFormModal
                title="Add new instruction"
                open={modalOpen}
                isEdit={false}
                onCancel={() => {
                    setModalOpen(false);
                }}
                onSave={async (data: any) => {
                    Modal.confirm({
                        title: "Add",
                        content: 'are you sure',
                        onOk: async () => {
                            try {
                                await services.add_instruction(data)
                                setModalOpen(false)
                                setOnRefresh(true)
                                message.success('Success');
                            } catch (e: any) {
                                message.error(e.message);
                            }
                        }
                    })
                }}
            />
        </>
    );
};
