
import useFetchData from '@/hooks/useFetchData'
import useLookupData from '@/hooks/useLookupData'
import useProcessData from '@/hooks/useProcessData'
import { SAPServiceType } from '@/services/API'
import { domain } from '@/services/del-expense/data'
import { Card, Form, message, Modal, Spin } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import React, { useEffect } from 'react'
import PriceRateDetail from './PriceRateDetail'
import { ProForm, ProFormGroup, ProFormSelect } from '@ant-design/pro-components'

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const ChangeLocation: React.FC<{
    visible: boolean,
    tran?: domain.delivery.DeliveryCost,
    onComplete: () => void;
    onHide: () => void
}> = ({ visible, onComplete, onHide, tran }) => {

    const [form] = Form.useForm()
    const a = { name: "SAP", action: 'list_provinces' } as SAPServiceType
    const provinces = useLookupData({ name: "SAP", action: 'list_provinces' } as SAPServiceType, true)
    const districts = useLookupData({ name: "SAP", action: 'list_districts' } as SAPServiceType, false)
    const findPriceRateSrv = useFetchData<{ docEntry: number, province: string, district: string }, { procId: string, item: domain.delivery.DeliveryCost }>({ name: 'SAP', action: 'calculate_price_rate' } as SAPServiceType)
    const commitChange = useProcessData<{ procId: string, remarks: string }, string>({ name: "SAP", action: 'commit_recalculate_price_rate' } as SAPServiceType)

    useEffect(() => {        
        provinces.loadAll()
    }, [])

    useEffect(() => {
        // if (!visible) return
        if(visible){
            findPriceRateSrv.clear()
            form.resetFields()
            provinces.loadAll((data) => {
                const proId = data.find(item => item.display === tran?.province)?.value
                proId && districts.load(proId.toString())
                form.setFieldsValue({
                    province: tran?.province,
                    district:  districts.data.find(it=> it.value ==  tran?.district)?.display
                })
            })
        }       

    }, [visible, tran])

    const listDistricts = (id: number) => {
        form.resetFields(['district'])
        districts.load(id?.toString())
    }

    const calcPriceRate = () => {

        const data = form.getFieldsValue()
        const { province, district } = data
        if (tran && tran.province === province && tran.district === district) {
            findPriceRateSrv.clear()
            message.warning("Location is the same to the original, Please choose the difference one.")
        }
        
        if (tran && province && district) {
            findPriceRateSrv.fetch({
                docEntry: tran.docEntry,
                province: provinces.data?.find(f=> f.value==province)?.display||province,
                district: district || districts.data.find(it=> it.value ==  tran?.district)?.display
            }, (data) => { if (!data?.item) message.error("Failed to find price rate") })
        }
    }

    const applyNewPriceRate = () => {

        form.validateFields().then(data => {
            const { remarks } = data
            Modal.confirm({
                title: 'Confirmation',
                content: 'Are you sure to process?',
                onOk: () => {
                    findPriceRateSrv.data && findPriceRateSrv.data.item && commitChange.exec({ procId: findPriceRateSrv.data.procId, remarks: remarks }, () => {
                        onComplete()
                        message.success("Changing location is successful")
                    })
                }
            })
        })
    }

    return <Modal destroyOnClose
        open={visible}
        width={'1000px'}
        onOk={applyNewPriceRate}
        onCancel={onHide}
        okButtonProps={{ disabled: !findPriceRateSrv.data?.item }}
        title='Change Shipped to Address'>
        <Card>
            <Spin spinning={findPriceRateSrv.loading || commitChange.loading}>
                <ProForm form={form} {...layout} 
                    submitter={{
                        render: (props, doms) => {return []}
                    }}
                    onValuesChange={(changeValues) => {
                        if ('province' in changeValues) {
                            const { province } = changeValues
                           
                            listDistricts(province)
                        }

                        if ('district' in changeValues) {
                            calcPriceRate()
                        }
                    }}
                >

                    <ProFormGroup size={2}>
                        <ProFormSelect  width={'sm'} name='province' rules={[{ required: true }]} options={provinces.data?.map(it => ({ label: it.display, value: it.value }))} />
                        <ProFormSelect width={'sm'} name='district' rules={[{ required: true }]} options={districts.data?.map(it => ({ label: it.display, value: it.display }))} />
                    </ProFormGroup>

                    <Form.Item label="Remarks" name="remarks" rules={[{ required: true }]}>
                        <TextArea />
                    </Form.Item>
                </ProForm>
                {findPriceRateSrv.data && findPriceRateSrv.data.item && <PriceRateDetail item={findPriceRateSrv.data.item} />}
            </Spin>
        </Card>
    </Modal>
}

export default ChangeLocation
