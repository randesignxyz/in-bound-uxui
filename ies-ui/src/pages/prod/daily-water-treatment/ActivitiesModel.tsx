import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea, ProList, ProTable } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { DailyWaterTreatmentActivities, DailyWaterTreatmentItem } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import { simpleRequestActions } from '@/services/model';
import { useAccess } from '@umijs/max';
import { DailyWaterTreatmentMachineServiceAPI } from './service';
import { formatDateTime } from '@/pages/utils';
import moment from 'moment';

interface Props extends FormModalProps {
    data: string
}
export default ({ data, ...props }: Props) => {
    const [form] = useForm<DailyWaterTreatmentItem>();
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = DailyWaterTreatmentMachineServiceAPI(requestActions);
    const [act, setAct] = useState<DailyWaterTreatmentActivities[]>([])

    useEffect(() => {
        const getAct = async () => {
                const da = await services.paging_shift_activities(data)
                setAct(da.items)
        }
        console.log(data)
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
                
                <ProList<DailyWaterTreatmentActivities>
                    rowKey="id"
                    dataSource={act}
                    metas={{
                        title: {
                            render:(_,r)=>{
                                return[
                                    [(r?.machine_id[0]?.machine ? r?.machine_id[0]?.machine  : 'Assign')]
                                ]
                            }
                          },
                        subTitle: {
                            // dataIndex: 'action',
                            render:(_,r)=>{
                                return[
                                    [r.action, r.actionBy].join(' by ')
                                ]
                            }
                        },
                        // subTitle: {
                        //     render: (_, r) => {
                        //         return [
                        //             [r.action, r.actionBy].join(' by '),
                        //             [' ' + formatDatewithNumber(r.actionDate)],
                        //         ];
                        //     },
                        // },
                        // description: {
                        //     render:(_,r)=>{
                        //         return[
                        //             [r.action, r.actionBy].join(' by ')
                        //         ]
                        //     }
                        // },
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
