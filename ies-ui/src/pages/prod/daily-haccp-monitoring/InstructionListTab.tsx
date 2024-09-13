import { useAccess } from '@umijs/max';
import { useEffect, useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Dropdown, FormProps, MenuProps, message, Modal, Typography } from 'antd';
import { DashOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DailyHACCPMonitoringServiceAPI } from './service';
import { HACCPMonitoringInstruction } from './data';
import InstructionFormModal from './InstructionFormModal';

interface Props extends FormProps {
    group_line: string;
    refresh: boolean
    onRefresh: (a: boolean) => void,
}

export default ({ group_line, refresh, onRefresh }: Props) => {
    const access = useAccess();
    const [data, setData] = useState();
    const [modalOpen, setModalOpen] = useState(false)
    const [defaultValue, setdefaultValue] = useState<HACCPMonitoringInstruction>([])
    const requestActions = simpleRequestActions();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const { Text } = Typography;

    useEffect(() => {
        const getData = async () => {
            const data = await services.get_instruction(group_line)
            setData(data)
        }
        getData()
        onRefresh(false)
    }, [refresh == true, group_line])

    const items = (row: HACCPMonitoringInstruction): MenuProps['items'] => [
        {
            key: 1,
            label: 'Edit',
            itemIcon: <EditOutlined />,
            onClick: () => { setModalOpen(true), setdefaultValue(row) }
        },
        {
            key: 2,
            label: 'Delete',
            itemIcon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                Modal.confirm({
                    title: 'Confirm',
                    content:
                        'Are you sure you want to delete this instruction?',
                    onOk: async () => {
                        services.add_instruction({
                            id: row.id,
                            instruction: row.instruction,
                            active: 0,
                        });
                        onRefresh(true)
                        actionRef.current?.reloadAndRest?.();
                        message.success('Success');
                    },
                });
            },
        },
    ];

    return (
        <>
            <ProTable<HACCPMonitoringInstruction>
                size="small"
                search={false}
                rowKey="id"
                dataSource={data}
                options={{
                    density: false,
                    fullScreen: false,
                    reload: false,
                    setting: false,
                }}
                pagination={false}
                columns={[
                    {
                        title: 'No',
                        render: (_, r, index) => index + 1
                    },
                    {
                        title: 'Instruction',
                        dataIndex: 'instruction',
                    },
                    {
                        render: (_, r) => (
                            <>
                                <Dropdown
                                    menu={{
                                        items: items(r),
                                        style: {
                                            width: 200,
                                        },
                                    }}
                                >
                                    <a>
                                        <DashOutlined />
                                    </a>
                                </Dropdown>
                            </>
                        ),
                    },
                ]}
            />
            <InstructionFormModal
                title="Edit Form"
                open={modalOpen}
                isEdit={true}
                defaultVal={defaultValue.instruction}
                onCancel={() => {
                    setModalOpen(false);
                }}
                onSave={async (data: any) => {
                    Modal.confirm({
                        title: "Edit",
                        content: 'are you sure',
                        onOk: async () => {
                            try {
                                services.add_instruction({
                                    id: defaultValue.id,
                                    instruction: data.instruction,
                                    active:1
                                });
                                setModalOpen(false)
                                onRefresh(true)
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
