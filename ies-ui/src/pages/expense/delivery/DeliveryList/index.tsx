import React, { useState, useEffect } from 'react'
import DeliveryListComp from './components/List'
import { Card, Modal, Spin, message } from 'antd'
import CreateDeliveryForm from './components/CreateDeliveryForm'
import { useModel } from 'umi'
import { searchDeliveryCost } from '@/models/delivery'
import { DeliveryModel } from '../Model/model'

const DeliveryList: React.FC<{}> = ({ }) => {

    const [createFormVisible, setCreateFormVisible] = useState(false)
    const [forceUpdate, setForceUpdate] = useState<number>(0)
    const { loading, initLookupData, loadInitLookupData, addNewInventory } = useModel('delivery');  
    // const model = DeliveryModel();
    useEffect(() => {
        loadInitLookupData()
    }, [])

    return <Card>
        <Spin spinning={loading}>
            <DeliveryListComp
                initLookupData={initLookupData}
                forceUpdate = {forceUpdate}
                onAdd={() => {
                    setCreateFormVisible(true)
                }} />
            <CreateDeliveryForm
                initLookupData={initLookupData}
                visible={createFormVisible}               
                onAddNewDelivery={(data) => {
                    Modal.confirm({
                        title: 'Confirmation',
                        content: 'Are you sure to add new delivery settlement?',
                        onOk: () => {
                            addNewInventory(data, () => {
                                message.success("Delivery settlement added successfully.")
                                setForceUpdate(value => value +1 )
                                setCreateFormVisible(false)
                            })
                        }
                    })
                }}
                onCancel={() => setCreateFormVisible(false)}
            />
        </Spin>

    </Card>
}

export default DeliveryList