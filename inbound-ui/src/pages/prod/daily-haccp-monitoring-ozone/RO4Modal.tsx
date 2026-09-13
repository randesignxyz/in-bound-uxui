import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { HACCPMonitoringOzoneList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, Row } from 'antd';
import { useAccess } from '@umijs/max';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: HACCPMonitoringOzoneList
    onSave: (data: HACCPMonitoringOzoneList) => void
}
export default ({ data, onSave, ...props }: Props) => {
    const access = useAccess();
    const [form] = useForm<HACCPMonitoringOzoneList>();
    const [initData, setInitData] = useState<HACCPMonitoringOzoneList>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            form.resetFields();
            console.log(data)
        }
    }, [props.open]);

    return (
        <FormModalComp
            title={data?.control}
            {...props}
            width={'600px'}
            readOnly={!(data?.assign_to_user?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre)}
            okText={data?.status !== 'pending' ? 'Update' : 'Submit'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                let updatedWarningCount = 0;
                let status = 'normal'
                if (data?.control == 'Pressure (oPRP5) (CCP7)') {
                    if (parseFloat(dataForm.cartridge_um3) > 5.1) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.cartridge_um08) > 5.1) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.feed_array1) > 15) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.feed_array2) > 15) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 15) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'ΔP (oPRP5) (CCP8)') {
                    if (parseFloat(dataForm.cartridge_um3) < 0.2) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.cartridge_um08) < 0.2) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.array1) > 3.5) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.array2) > 3.5) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'pH') {
                    if (parseFloat(dataForm.feed) < 6.5 || parseFloat(dataForm.feed) > 8.5) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) < 6.2) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.blending) < 6.5 || parseFloat(dataForm.blending) > 8.5) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) < 5.0 || parseFloat(dataForm.concentrate) > 9.0) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'TDS (CCP8)') {
                    if (parseFloat(dataForm.feed) > 400) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) > 30) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.blending) > 30) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 1000) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'Flow rate') {
                    if (parseFloat(dataForm.feed) > 75000) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 15000) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.recycle) > 25000) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.ft171_ft192) > 40000) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.adjustment_ft382) > 14000) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) < 52 || parseFloat(dataForm.permeate) > 62) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'Permeate Conductivity') {
                    if (parseFloat(dataForm.ca384) > 60) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.ca181) > 60) {
                        updatedWarningCount++;
                    }
                }
                

                if (updatedWarningCount > 0) {
                    status = 'warning'
                }
                let entity
                if (initData?.status == 'pending') {
                    entity = {
                        ...dataForm,
                        id: data?.id,
                        warning_count: updatedWarningCount,
                        status: status,
                        action: "Add Treatment",
                        haccp_ozone_id: data?.haccp_ozone_id,
                    }
                } else {
                    const changes = [
                        initData?.cartridge_um3 != dataForm.cartridge_um3 ? `Cartridge 3µm from ${initData?.cartridge_um3} to ${dataForm.cartridge_um3}` : '',
                        initData?.cartridge_um08 != dataForm.cartridge_um08 ? `Cartridge 0.8µm from ${initData?.cartridge_um08} to ${dataForm.cartridge_um08}` : '',
                        initData?.feed_array1 != dataForm.feed_array1 ? `Feed Array 1 (PT141) from ${initData?.feed_array1} to ${dataForm.feed_array1}` : '',
                        initData?.feed_array2 != dataForm.feed_array2 ? `Feed Array 2 (PT142) from ${initData?.feed_array2} to ${dataForm.feed_array2}` : '',
                        initData?.blending != dataForm.blending ? `Blending from ${initData?.blending} to ${dataForm.blending}` : '',
                        initData?.array1 != dataForm.array1 ? `Array 1 from ${initData?.array1} to ${dataForm.array1}` : '',
                        initData?.array2 != dataForm.array2 ? `Array 2 from ${initData?.array2} to ${dataForm.array2}` : '',
                        initData?.feed_ro != dataForm.feed_ro ? `Feed RO from ${initData?.feed_ro} to ${dataForm.feed_ro}` : '',
                        initData?.recycle != dataForm.recycle ? `Recycle from ${initData?.recycle} to ${dataForm.recycle}` : '',
                        initData?.ft171_ft192 != dataForm.ft171_ft192 ? `FT171 + FT192 from ${initData?.ft171_ft192} to ${dataForm.ft171_ft192}` : '',
                        initData?.adjustment_ft382 != dataForm.adjustment_ft382 ? `Adjustment FT382 from ${initData?.adjustment_ft382} to ${dataForm.adjustment_ft382}` : '',
                        initData?.permeate != dataForm.permeate ? `Permeate from ${initData?.permeate} to ${dataForm.permeate}` : '',
                        initData?.feed != dataForm.feed ? `Feed from ${initData?.feed} to ${dataForm.feed}` : '',
                        initData?.concentrate != dataForm.concentrate ? `Concentrate from ${initData?.concentrate} to ${dataForm.concentrate}` : '',
                        initData?.ca384 != dataForm.ca384 ? `1 CA384 from ${initData?.ca384} to ${dataForm.ca384}` : '',
                        initData?.ca181 != dataForm.ca181 ? `2 CA181 from ${initData?.ca181} to ${dataForm.ca181}` : '',
                        initData?.remark != dataForm.remark ? `Remark from ${initData?.remark == null ? '' : initData?.remark} to ${dataForm.remark}` : ''
                    ];
                    const actionString = changes.filter(change => change !== '').join(', ');

                    entity = {
                        ...dataForm,
                        id: data?.id,
                        warning_count: updatedWarningCount,
                        status: status,
                        action: `has modified ${actionString}`,
                        haccp_ozone_id: data?.haccp_ozone_id,
                    }
                }
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    {data?.control == 'Pressure (oPRP5) (CCP7)' ?
                        <>
                            <Row gutter={6}>
                                <Col span={12}>
                                    <ProFormText
                                        hasFeedback={false}
                                        rules={[{ required: true, message: 'Please Enter Cartridge 3µm' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                        label={
                                            <ProForm.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.cartridge_um3 !== currentValues.cartridge_um3}
                                            >
                                                {({ getFieldValue }) => {
                                                    const cartridgeUm3Value = getFieldValue('cartridge_um3');
                                                    return (
                                                        <div>
                                                            Cartridge 3µm
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 5.1 bar`})
                                                            </span>
                                                            {(Number(cartridgeUm3Value) > 5.1) && cartridgeUm3Value !== '' && cartridgeUm3Value !== null && (
                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            </ProForm.Item>
                                        }
                                        name={'cartridge_um3'}
                                        initialValue={data?.cartridge_um3}
                                        fieldProps={{
                                            type: 'number',
                                            step: 'any'
                                        }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <ProFormText
                                        hasFeedback={false}
                                        rules={[{ required: true, message: 'Please Enter Cartridge 0.8µm' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                        label={
                                            <ProForm.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.cartridge_um08 !== currentValues.cartridge_um08}
                                            >
                                                {({ getFieldValue }) => {
                                                    const cartridgeUm08Value = getFieldValue('cartridge_um08');
                                                    return (
                                                        <div>
                                                            Cartridge 0.8µm
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 5.1 bar`})
                                                            </span>
                                                            {(Number(cartridgeUm08Value) > 5.1) && cartridgeUm08Value !== '' && cartridgeUm08Value !== null && (
                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            </ProForm.Item>
                                        }
                                        name={'cartridge_um08'}
                                        initialValue={data?.cartridge_um08}
                                        fieldProps={{
                                            type: 'number',
                                            step: 'any'
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={6}>
                                <Col span={12}>
                                    <ProFormText
                                        hasFeedback={false}
                                        rules={[{ required: true, message: 'Please Enter Feed array 1' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                        label={
                                            <ProForm.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.feed_array1 !== currentValues.feed_array1}
                                            >
                                                {({ getFieldValue }) => {
                                                    const feedArray1Value = getFieldValue('feed_array1');
                                                    return (
                                                        <div>
                                                            Feed Array 1 (PT141)
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 15 bar`})
                                                            </span>
                                                            {(Number(feedArray1Value) > 15) && feedArray1Value !== '' && feedArray1Value !== null && (
                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            </ProForm.Item>
                                        }
                                        name={'feed_array1'}
                                        initialValue={data?.feed_array1}
                                        fieldProps={{
                                            type: 'number',
                                            step: 'any'
                                        }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <ProFormText
                                        hasFeedback={false}
                                        rules={[{ required: true, message: 'Please Enter Feed array 2' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                        label={
                                            <ProForm.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.feed_array2 !== currentValues.feed_array2}
                                            >
                                                {({ getFieldValue }) => {
                                                    const feedArray2Value = getFieldValue('feed_array2');
                                                    return (
                                                        <div>
                                                            Feed Array 2 (PT142)
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 15 bar`})
                                                            </span>
                                                            {(Number(feedArray2Value) > 15) && feedArray2Value !== '' && feedArray2Value !== null && (
                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            </ProForm.Item>
                                        }
                                        name={'feed_array2'}
                                        initialValue={data?.feed_array2}
                                        fieldProps={{
                                            type: 'number',
                                            step: 'any'
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={6}>
                                <Col span={12}>
                                    <ProFormText
                                        hasFeedback={false}
                                        rules={[{ required: true, message: 'Please Enter Concentrate' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                        label={
                                            <ProForm.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.concentrate !== currentValues.concentrate}
                                            >
                                                {({ getFieldValue }) => {
                                                    const concentrateValue = getFieldValue('concentrate');
                                                    return (
                                                        <div>
                                                            Concentrate (PT145)
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 15 bar`})
                                                            </span>
                                                            {(Number(concentrateValue) > 15) && concentrateValue !== '' && concentrateValue !== null && (
                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            </ProForm.Item>
                                        }
                                        name={'concentrate'}
                                        initialValue={data?.concentrate}
                                        fieldProps={{
                                            type: 'number',
                                            step: 'any'
                                        }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <ProFormTextArea
                                        hasFeedback={false}
                                        label="Remark"
                                        name={'remark'}
                                        initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                                    />
                                </Col>
                            </Row>
                        </>
                        : (data?.control == 'ΔP (oPRP5) (CCP8)') ?
                            <>
                                <Row gutter={6}>
                                    <Col span={12}>
                                        <ProFormText
                                            hasFeedback={false}
                                            rules={[{ required: true, message: 'Please Enter ΔP Cartridge 3µm' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                            label={
                                                <ProForm.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) => prevValues.cartridge_um3 !== currentValues.cartridge_um3}
                                                >
                                                    {({ getFieldValue }) => {
                                                        const cartridgeUm3Value = getFieldValue('cartridge_um3');
                                                        return (
                                                            <div>
                                                                ΔP Cartridge 3µm
                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                    ({`> 0.2 bar`})
                                                                </span>
                                                                {(Number(cartridgeUm3Value) < 0.2) && cartridgeUm3Value !== '' && cartridgeUm3Value !== null && (
                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </ProForm.Item>
                                            }
                                            name={'cartridge_um3'}
                                            initialValue={data?.cartridge_um3}
                                            fieldProps={{
                                                type: 'number',
                                                step: 'any'
                                            }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <ProFormText
                                            hasFeedback={false}
                                            rules={[{ required: true, message: 'Please Enter ΔP Cartridge 0.8µm' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                            label={
                                                <ProForm.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) => prevValues.cartridge_um08 !== currentValues.cartridge_um08}
                                                >
                                                    {({ getFieldValue }) => {
                                                        const cartridgeUm08Value = getFieldValue('cartridge_um08');
                                                        return (
                                                            <div>
                                                                ΔP Cartridge 0.8µm
                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                    ({`> 0.2 bar`})
                                                                </span>
                                                                {(Number(cartridgeUm08Value) < 0.2) && cartridgeUm08Value !== '' && cartridgeUm08Value !== null && (
                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </ProForm.Item>
                                            }
                                            name={'cartridge_um08'}
                                            initialValue={data?.cartridge_um08}
                                            fieldProps={{
                                                type: 'number',
                                                step: 'any'
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={6}>
                                    <Col span={12}>
                                        <ProFormText
                                            hasFeedback={false}
                                            rules={[{ required: true, message: 'Please Enter Array 1' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                            label={
                                                <ProForm.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) => prevValues.array1 !== currentValues.array1}
                                                >
                                                    {({ getFieldValue }) => {
                                                        const array1Value = getFieldValue('array1');
                                                        return (
                                                            <div>
                                                                Array 1 PT(141-142)
                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                    ({`< 3.5 bar`})
                                                                </span>
                                                                {(Number(array1Value) > 3.5) && array1Value !== '' && array1Value !== null && (
                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </ProForm.Item>
                                            }
                                            name={'array1'}
                                            initialValue={data?.array1}
                                            fieldProps={{
                                                type: 'number',
                                                step: 'any'
                                            }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <ProFormText
                                            hasFeedback={false}
                                            rules={[{ required: true, message: 'Please Enter Array 2' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                            label={
                                                <ProForm.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) => prevValues.array2 !== currentValues.array2}
                                                >
                                                    {({ getFieldValue }) => {
                                                        const array2Value = getFieldValue('array2');
                                                        return (
                                                            <div>
                                                                Array 2 PT(142-145)
                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                    ({`< 3.5 bar`})
                                                                </span>
                                                                {(Number(array2Value) > 3.5) && array2Value !== '' && array2Value !== null && (
                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </ProForm.Item>
                                            }
                                            name={'array2'}
                                            initialValue={data?.array2}
                                            fieldProps={{
                                                type: 'number',
                                                step: 'any'
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={6}>
                                    <Col span={24}>
                                        <ProFormTextArea
                                            hasFeedback={false}
                                            label="Remark"
                                            name={'remark'}
                                            initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                                        />
                                    </Col>
                                </Row>
                            </>
                            : (data?.control == 'pH' || data?.control == 'TDS (CCP8)') ?
                                <>
                                    <Row gutter={6}>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Feed' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.feed !== currentValues.feed}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const feedValue = getFieldValue('feed');
                                                            return (
                                                                <div>

                                                                    {data?.control == 'pH' ?
                                                                        <>
                                                                            Feed PHT133
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`6.5 - 8.5`})
                                                                            </span>
                                                                            {(Number(feedValue) < 6.5 || Number(feedValue) > 8.5) && feedValue !== '' && feedValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : data?.control == 'TDS (CCP8)' ?
                                                                            <>
                                                                                Feed FT102
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`< 400 ppm`})
                                                                                </span>
                                                                                {(Number(feedValue) > 400) && feedValue !== '' && feedValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> : <></>}

                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'feed'}
                                                initialValue={data?.feed}
                                                fieldProps={{
                                                    type: 'number',
                                                    step: 'any'
                                                }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Permeate' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.permeate !== currentValues.permeate}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const permeateValue = getFieldValue('permeate');
                                                            return (
                                                                <div>
                                                                    Permeate
                                                                    {data?.control == 'pH' ?
                                                                        <>
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`> 6.2`})
                                                                            </span>
                                                                            {(Number(permeateValue) < 6.2) && permeateValue !== '' && permeateValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : data?.control == 'TDS (CCP8)' ?
                                                                            <>
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`< 30 ppm`})
                                                                                </span>
                                                                                {(Number(permeateValue) > 30) && permeateValue !== '' && permeateValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> : <></>}
                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'permeate'}
                                                initialValue={data?.permeate}
                                                fieldProps={{
                                                    type: 'number',
                                                    step: 'any'
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row gutter={6}>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Blending' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.blending !== currentValues.blending}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const blendingValue = getFieldValue('blending');
                                                            return (
                                                                <div>
                                                                    Blending
                                                                    {data?.control == 'pH' ?
                                                                        <>
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`6.5 - 8.5`})
                                                                            </span>
                                                                            {(Number(blendingValue) < 6.5 || Number(blendingValue) > 8.5) && blendingValue !== '' && blendingValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : data?.control == 'TDS (CCP8)' ?
                                                                            <>
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`< 30 ppm`})
                                                                                </span>
                                                                                {(Number(blendingValue) > 30) && blendingValue !== '' && blendingValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> : <></>}
                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'blending'}
                                                initialValue={data?.blending}
                                                fieldProps={{
                                                    type: 'number',
                                                    step: 'any'
                                                }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Concentrate' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.concentrate !== currentValues.concentrate}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const concentrateValue = getFieldValue('concentrate');
                                                            return (
                                                                <div>
                                                                    Concentrate
                                                                    {data?.control == 'pH' ?
                                                                        <>
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`5.0 - 9.0`})
                                                                            </span>
                                                                            {(Number(concentrateValue) < 5.0 || Number(concentrateValue) > 9.0) && concentrateValue !== '' && concentrateValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : data?.control == 'TDS (CCP8)' ?
                                                                            <>
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`< 1000 ppm`})
                                                                                </span>
                                                                                {(Number(concentrateValue) > 1000) && concentrateValue !== '' && concentrateValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> : <></>}
                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'concentrate'}
                                                initialValue={data?.concentrate}
                                                fieldProps={{
                                                    type: 'number',
                                                    step: 'any'
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row gutter={6}>
                                        <Col span={24}>
                                            <ProFormTextArea
                                                hasFeedback={false}
                                                label="Remark"
                                                name={'remark'}
                                                initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                                            />
                                        </Col>
                                    </Row>
                                </>
                                : (data?.control == 'Flow rate') ?
                                    <>
                                        <Row gutter={6}>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter Feed FT102' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.feed !== currentValues.feed}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const feedValue = getFieldValue('feed');
                                                                return (
                                                                    <div>
                                                                        Feed FT102
                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 75000 L/h`})
                                                                        </span>
                                                                        {(Number(feedValue) > 75000) && feedValue !== '' && feedValue !== null && (
                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'feed'}
                                                    initialValue={data?.feed}
                                                    fieldProps={{
                                                        type: 'number',
                                                        step: 'any'
                                                    }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter Concentrate FT171' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.concentrate !== currentValues.concentrate}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const concentrateValue = getFieldValue('concentrate');
                                                                return (
                                                                    <div>
                                                                        Concentrate FT171
                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 15000 L/h`})
                                                                        </span>
                                                                        {(Number(concentrateValue) > 15000) && concentrateValue !== '' && concentrateValue !== null && (
                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'concentrate'}
                                                    initialValue={data?.concentrate}
                                                    fieldProps={{
                                                        type: 'number',
                                                        step: 'any'
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={6}>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter Recycle FT192' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.recycle !== currentValues.recycle}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const recycleValue = getFieldValue('recycle');
                                                                return (
                                                                    <div>
                                                                        Recycle FT192
                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 25000 L/h`})
                                                                        </span>
                                                                        {(Number(recycleValue) > 25000) && recycleValue !== '' && recycleValue !== null && (
                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'recycle'}
                                                    initialValue={data?.recycle}
                                                    fieldProps={{
                                                        type: 'number',
                                                        step: 'any'
                                                    }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter FT171 + FT192' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.ft171_ft192 !== currentValues.ft171_ft192}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const ft171ft192Value = getFieldValue('ft171_ft192');
                                                                return (
                                                                    <div>
                                                                        FT171 + FT192
                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 40000 L/h`})
                                                                        </span>
                                                                        {(Number(ft171ft192Value) > 40000) && ft171ft192Value !== '' && ft171ft192Value !== null && (
                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'ft171_ft192'}
                                                    initialValue={data?.ft171_ft192}
                                                    fieldProps={{
                                                        type: 'number',
                                                        step: 'any'
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={6}>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter Adjustment Ft382' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.adjustment_ft382 !== currentValues.adjustment_ft382}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const adjustmentft382Value = getFieldValue('adjustment_ft382');
                                                                return (
                                                                    <div>
                                                                        Adjustment Ft382
                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 14000 L/h`})
                                                                        </span>
                                                                        {(Number(adjustmentft382Value) > 14000) && adjustmentft382Value !== '' && adjustmentft382Value !== null && (
                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'adjustment_ft382'}
                                                    initialValue={data?.adjustment_ft382}
                                                    fieldProps={{
                                                        type: 'number',
                                                        step: 'any'
                                                    }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter Permeate' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.permeate !== currentValues.permeate}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const permeateValue = getFieldValue('permeate');
                                                                return (
                                                                    <div>
                                                                        Permeate
                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`52 - 62 m³/h`})
                                                                        </span>
                                                                        {(Number(permeateValue) < 52 || Number(permeateValue) > 62) && permeateValue !== '' && permeateValue !== null && (
                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'permeate'}
                                                    initialValue={data?.permeate}
                                                    fieldProps={{
                                                        type: 'number',
                                                        step: 'any'
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={6}>
                                            <Col span={24}>
                                                <ProFormTextArea
                                                    hasFeedback={false}
                                                    label="Remark"
                                                    name={'remark'}
                                                    initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                                                />
                                            </Col>
                                        </Row>
                                    </>

                                    : (data?.control == 'Permeate Conductivity') ?
                                        <>
                                            <Row gutter={6}>
                                                <Col span={12}>
                                                    <ProFormText
                                                        hasFeedback={false}
                                                        rules={[{ required: true, message: 'Please Enter 1 CA384' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                        label={
                                                            <ProForm.Item
                                                                noStyle
                                                                shouldUpdate={(prevValues, currentValues) => prevValues.ca384 !== currentValues.ca384}
                                                            >
                                                                {({ getFieldValue }) => {
                                                                    const ca384Value = getFieldValue('ca384');
                                                                    return (
                                                                        <div>
                                                                            1 CA384
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`< 60 µS`})
                                                                            </span>
                                                                            {(Number(ca384Value) > 60) && ca384Value !== '' && ca384Value !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }}
                                                            </ProForm.Item>
                                                        }
                                                        name={'ca384'}
                                                        initialValue={data?.ca384}
                                                        fieldProps={{
                                                            type: 'number',
                                                            step: 'any'
                                                        }}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <ProFormText
                                                        hasFeedback={false}
                                                        rules={[{ required: true, message: 'Please Enter 2 CA181' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                        label={
                                                            <ProForm.Item
                                                                noStyle
                                                                shouldUpdate={(prevValues, currentValues) => prevValues.ca181 !== currentValues.ca181}
                                                            >
                                                                {({ getFieldValue }) => {
                                                                    const ca181Value = getFieldValue('ca181');
                                                                    return (
                                                                        <div>
                                                                            2 CA181
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`< 60 µS`})
                                                                            </span>
                                                                            {(Number(ca181Value) > 60) && ca181Value !== '' && ca181Value !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }}
                                                            </ProForm.Item>
                                                        }
                                                        name={'ca181'}
                                                        initialValue={data?.ca181}
                                                        fieldProps={{
                                                            type: 'number',
                                                            step: 'any'
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row gutter={6}>
                                                <Col span={24}>
                                                    <ProFormTextArea
                                                        hasFeedback={false}
                                                        label="Remark"
                                                        name={'remark'}
                                                        initialValue={data?.status !== 'pending' ? (data?.remark == null ? '-' : data?.remark) : data?.remark}
                                                    />
                                                </Col>
                                            </Row>
                                        </> : <></>}
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
