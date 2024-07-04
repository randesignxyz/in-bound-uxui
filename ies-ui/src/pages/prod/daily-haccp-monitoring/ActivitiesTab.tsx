import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea, ProList, ProTable } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { HACCPMonitoringActivities, HACCPMonitoringList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import { simpleRequestActions } from '@/services/model';
import { useAccess } from '@umijs/max';
import { DailyHACCPMonitoringServiceAPI } from './service';
import { formatDateTime } from '@/pages/utils';
import moment from 'moment';

interface Props extends FormModalProps {
    data: string,
    // type:string
}
export default ({ data, ...props }: Props) => {
    const [form] = useForm<HACCPMonitoringList>();
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const [act, setAct] = useState<HACCPMonitoringActivities[]>([])

    useEffect(() => {
        const getAct = async () => {
                const da = await services.get_haccp_activities(data)
                setAct(da)
                console.log(da)
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
                
                <ProList<HACCPMonitoringActivities>
                    rowKey="id"
                    dataSource={act}
                    metas={{
                        title: {
                            render:(_,r)=>{
                                return[
                                    [(r?.line_id == 0 ?  'Assign' : r?.line_id != 0 ? 'Modified' : '')]
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
