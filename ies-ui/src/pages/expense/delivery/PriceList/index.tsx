import React, { useState, useEffect } from 'react'
import { useModel } from 'umi'
import { Card, Form, Select, Input, Modal, message, Spin } from 'antd'
import PriceList from './components/PriceList'
import AddPrice from './components/AddPrice'
import moment from 'moment'
import AddPriceItem from './components/AddPriceItem'
import useLookupData from '@/hooks/useLookupData'
import { SAPServiceType } from '@/services/API'
import { domain } from '@/services/del-expense/data'
import { PageContainer } from '@ant-design/pro-components'
import ImportFileButton from '@/components/ImportFileButton'
import ImportPrice from './components/ImportPrice'
import { ImportedPriceRate } from '../data.type'
import { DataResponse } from '@/services/shared/data'

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

const DeliveryPriceList: React.FC<{}> = ({ }) => {

    const [importedData, setImportedData] = useState<DataResponse<ImportedPriceRate>>()
    const [confirmImportModal, setConfirmImportModal] = useState(false);
    const [uploading, setUploading] = useState(false)

    const productTypeLookupData = useLookupData({ name: 'SAP', action: 'product_type' } as SAPServiceType)

    const {
        outsourceData,
        outsourcePriceList,
        pricePlaceList,
        deliveryItemList,
        loadOutsource,
        loadOutsourcePrice,
        clearOutsourcePrice,
        loadPricePlace,
        loadDeliveryItem,
        savePrice,
        deletePrice,
        addPriceItem,
        deletePriceItem
    } = useModel('deliveryPriceList')
    const [selectedItem, setSelectedItem] = useState<domain.delivery.Outsource>()
    const [addVisible, setAddVisible] = useState<boolean>(false)
    const [selectedPrice, setSelectedPrice] = useState<domain.delivery.OutsourcePrice>()
    const [addItemVisible, setAddItemVisible] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        loadOutsource('')
        productTypeLookupData.loadAll()
    }, [])

    useEffect(() => {
        if (selectedItem) { loadingData(selectedItem.id) }
        else clearOutsourcePrice()
    }, [selectedItem])



    const loadingData = async (id: number) => {
        await loadOutsourcePrice(id)
    }


    const findPreviousPriceHandler = (destCode: string, type: string, effectiveDate: moment.Moment, productTypeId: number) => {

        const items = outsourcePriceList?.data.filter(item => item.destCode == destCode && item.type == type && item.productTypeId == productTypeId).sort((a, b) => (b.expiryDate || 0) - (a.expiryDate || 0))

        const overlapItems = items?.filter(item => item.expiryDate && effectiveDate.diff(moment(item.expiryDate), 'day') <= 0)

        if (overlapItems && overlapItems.length > 0) {
            return overlapItems[0]
        }
        const item = items?.find(item => !item.expiryDate)
        if (item) return item
        return items ? items[0] : undefined
    }

    const savePriceHandler = (destCode: string, uom: String, currency: string, type: string, productTypeId: number, effectiveDate: moment.Moment, expiryDate?: moment.Moment, cb?: () => void) => {
        Modal.confirm({
            autoFocusButton: "ok",
            title: "Save Price",
            content: "Are you sure to save?",
            onOk: () => {
                selectedItem && savePrice(selectedItem.id, destCode, uom, currency, type, productTypeId, effectiveDate, expiryDate, () => {
                    loadOutsourcePrice(selectedItem.id)
                    cb && cb()
                })
            }
        })
    }

    const onDeleteHandler = (item: domain.delivery.OutsourcePrice) => {
        // Modal.confirm({
        //     autoFocusButton: "cancel",
        //     title: "Deleting Price",
        //     content: "Are you sure to delete?",
        //     onOk: () => {
        selectedItem && deletePrice(item, () => {
            loadOutsourcePrice(selectedItem.id)
            message.info({
                content: "Delete successfully"
            })
        })
        //     }
        // })
    }

    const onAddPriceItemHandler = (itemCode: string, unit: number, price: number, cb?: () => void) => {
        Modal.confirm({
            autoFocusButton: "ok",
            title: "Adding Price Item",
            content: "Are you sure to add item?",
            onOk: () => {
                selectedItem && selectedPrice && addPriceItem(selectedPrice.id, itemCode, unit, price, () => {
                    loadOutsourcePrice(selectedItem.id)
                    cb && cb()
                })
            }
        })
    }

    const onDeleteItemHandler = (item: domain.delivery.OutsourcePriceItem) => {

        // Modal.confirm({
        //     autoFocusButton: "ok",
        //     title: "Deleting Price Item",
        //     content: "Are you sure to delete item?",
        //     onOk: () => {
        deletePriceItem(item, () => {
            selectedItem && loadOutsourcePrice(selectedItem.id)
            message.info({
                content: "Delete successfully"
            })
        })
        //     }
        // })
    }

    return <PageContainer onBack={() => history.back()} breadcrumb={undefined} title="Price List" >
        <Spin spinning={uploading}>
            <Card size='small' title="Outsource Info" extra={[<ImportFileButton<ImportedPriceRate>
                importedKey={'IMPORT_DELIVERY_PRICE_RATE'}
                onDataResponse={data => {
                    setImportedData(data)
                    setConfirmImportModal(true)
                }}
                onHandleChange={(status) => {
                    setUploading(status == 'uploading')
                    if (status == 'done') {

                        message.info("Upload completed.")
                    }
                }}
            />]}>
                <Form {...layout} size='small'>
                    <Form.Item label='Outsource' >
                        <Select optionFilterProp="children"
                            onChange={(value) => {
                                if (value) {
                                    setSelectedItem((outsourceData?.data || []).find(it => it.id == value))
                                } else {
                                    setSelectedItem(undefined)
                                }
                            }}
                            allowClear
                            showSearch>
                            {
                                (outsourceData?.data || []).map(it => {
                                    return <Select.Option key={it.id} value={it.id}> {it.name} </Select.Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="Gender">
                        <Input value={selectedItem?.gender} />
                    </Form.Item>
                    <Form.Item label="Phone">
                        <Input value={selectedItem?.phone} />
                    </Form.Item>
                </Form>
            </Card>

            <Card size='small' title='Price List' style={{ marginTop: '5px' }}>
                <PriceList loading={loading} dataSource={outsourcePriceList?.data}
                    productTypes={productTypeLookupData.data}
                    onAdd={() => {
                        loadPricePlace()
                        setAddVisible(true)
                    }}

                    onDelete={onDeleteHandler}

                    onAddItem={item => {
                        loadDeliveryItem(item.productTypeId)
                        setSelectedPrice(item)
                        setAddItemVisible(true)
                    }}

                    onDeleteItem={onDeleteItemHandler}
                />
            </Card>

            {addVisible && <AddPrice
                findPreviousPrice={findPreviousPriceHandler}
                pricePlaceList={pricePlaceList}
                productTypeList={productTypeLookupData.data}
                visible={addVisible}
                savePrice={savePriceHandler}
                onHide={() => setAddVisible(false)} />
            }

            {addItemVisible && <Spin spinning={loading}><AddPriceItem
                visible={addItemVisible}
                deliveryItemList={deliveryItemList?.data || []}
                onAddItem={onAddPriceItemHandler}
                onCancel={() => setAddItemVisible(false)}
            /></Spin>}
            {importedData && <ImportPrice datasources={importedData} onCancel={() => setConfirmImportModal(false)} open={confirmImportModal} />}
        </Spin>
    </PageContainer>
}

export default DeliveryPriceList