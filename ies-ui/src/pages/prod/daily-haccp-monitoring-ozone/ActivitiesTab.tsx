import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea, ProList, ProTable } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { HACCPMonitoringOzoneActivities, HACCPMonitoringOzoneList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import { simpleRequestActions } from '@/services/model';
import { useAccess } from '@umijs/max';
import { HACCPMonitoringOzoneServiceAPI } from './service';
import { formatDateTime } from '@/pages/utils';
import moment from 'moment';

interface Props extends FormModalProps {
    data: string,
}
export default ({ data, ...props }: Props) => {
    const [form] = useForm<HACCPMonitoringOzoneList>();
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = HACCPMonitoringOzoneServiceAPI(requestActions);
    const [act, setAct] = useState<HACCPMonitoringOzoneActivities[]>([])

    useEffect(() => {
        const getAct = async () => {
                const da = await services.getOzoneActivities(data)
                setAct(da)
        }
        getAct()
    }, [data]);

    return (
        // <FormModalComp
        //     title="Inventory Transfer"
        //     {...props}
        //     width={'600px'}
        //     readOnly

        // >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                
                <ProList<HACCPMonitoringOzoneActivities>
                    rowKey="id"
                    dataSource={act}
                    metas={{
                        title: {
                            render:(_,r)=>{
                                return[
                                    [(r?.control_id[0]?.control ? r?.control_id[0]?.control  : 'Assign')]
                                ]
                            }
                          },
                        // subTitle: {
                        //     // dataIndex: 'action',
                        //     render:(_,r)=>{
                        //         return[
                        //             [r.action, r.actionBy].join(' by ')
                        //         ]
                        //     }
                        // },
                        // subTitle: {
                        //     render: (_, r) => {
                        //         return [
                        //             [r.action, r.actionBy].join(' by '),
                        //             [' ' + formatDatewithNumber(r.actionDate)],
                        //         ];
                        //     },
                        // },
                        description: {
                            render:(_,r)=>{
                                return[
                                    <div style={{ direction: 'ltr', textAlign: 'left' }}>
                                    { [r.action, r.actionBy].join(' by ') }
                                </div>
                                ]
                            }
                        },
                        actions: {
                            render: (_, r) => [moment(r.actionDate).format('YYYY-MM-DD HH:m:ss a')],
                        },
                        // avatar: {
                        //   dataIndex: 'image',
                        //   editable: false,
                        // },
                        // description: {
                        //   dataIndex: 'desc',
                        // },
                    }}
                />
            </ProForm>
        // </FormModalComp>
    );
};
