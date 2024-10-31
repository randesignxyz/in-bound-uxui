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
                if (data?.control == 'Pressure') {
                    if (parseFloat(dataForm.feed_array1) > 15.0) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.feed_array2) > 15.0) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 15.0) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'ΔP (CCP1,2)') {
                    if (parseFloat(dataForm.array1) > 3.5) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.array2) > 3.5) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'Flow rate') {
                    if (parseFloat(dataForm.feed_ro) > 16) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.recycle) > 4) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 4) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) < 8 || parseFloat(dataForm.permeate) > 10) {
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
                    if (parseFloat(dataForm.concentrate) < 5.0 || parseFloat(dataForm.concentrate) > 9.0) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'TDS (CCP2)') {
                    if (parseFloat(dataForm.feed) > 300) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) > 30) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 1000) {
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
                        initData?.feed_array1 != dataForm.feed_array1 ? `Feed array 1 from ${initData?.feed_array1} to ${dataForm.feed_array1}` : '',
                        initData?.feed_array2 != dataForm.feed_array2 ? `Feed array 2 from ${initData?.feed_array2} to ${dataForm.feed_array2}` : '',
                        initData?.array1 != dataForm.array1 ? `Array 1 from ${initData?.array1} to ${dataForm.array1}` : '',
                        initData?.array2 != dataForm.array2 ? `Array 2 from ${initData?.array2} to ${dataForm.array2}` : '',
                        initData?.feed_ro != dataForm.feed_ro ? `Feed RO from ${initData?.feed_ro} to ${dataForm.feed_ro}` : '',
                        initData?.recycle != dataForm.recycle ? `Recycle from ${initData?.recycle} to ${dataForm.recycle}` : '',
                        initData?.permeate != dataForm.permeate ? `Permeate from ${initData?.permeate} to ${dataForm.permeate}` : '',
                        initData?.feed != dataForm.feed ? `Feed from ${initData?.feed} to ${dataForm.feed}` : '',
                        initData?.concentrate != dataForm.concentrate ? `Concentrate from ${initData?.concentrate} to ${dataForm.concentrate}` : '',
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
                    {data?.control == 'Pressure' ?
                        <>
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
                                                            Feed array 1
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 15.0 bar`})
                                                            </span>
                                                            {(Number(feedArray1Value) > 15.0) && feedArray1Value !== '' && feedArray1Value !== null && (
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
                                                            Feed array 2
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 15.0 bar`})
                                                            </span>
                                                            {(Number(feedArray2Value) > 15.0) && feedArray2Value !== '' && feedArray2Value !== null && (
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
                                                            Concentrate
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`< 15.0 bar`})
                                                            </span>
                                                            {(Number(concentrateValue) > 15.0) && concentrateValue !== '' && concentrateValue !== null && (
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
                        : (data?.control == 'ΔP (CCP1,2)') ?
                            <>
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
                                                                Array 1
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
                                                                Array 2
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
                            : (data?.control == 'Flow rate') ?
                                <>
                                    <Row gutter={6}>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Feed RO' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.feed_ro !== currentValues.feed_ro}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const feedROValue = getFieldValue('feed_ro');
                                                            return (
                                                                <div>
                                                                    Feed RO
                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                        ({`< 16 m³/h`})
                                                                    </span>
                                                                    {(Number(feedROValue) > 16) && feedROValue !== '' && feedROValue !== null && (
                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'feed_ro'}
                                                initialValue={data?.feed_ro}
                                                fieldProps={{
                                                    type: 'number',
                                                    step: 'any'
                                                }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Recycle' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.recycle !== currentValues.recycle}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const recycleValue = getFieldValue('recycle');
                                                            return (
                                                                <div>
                                                                    Recycle
                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                        ({`< 4 m³/h`})
                                                                    </span>
                                                                    {(Number(recycleValue) > 4) && recycleValue !== '' && recycleValue !== null && (
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
                                                                    Concentrate
                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                        ({`< 4 m³/h`})
                                                                    </span>
                                                                    {(Number(concentrateValue) > 4) && concentrateValue !== '' && concentrateValue !== null && (
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
                                                                        ({`8 - 10 m³/h`})
                                                                    </span>
                                                                    {(Number(permeateValue) < 8 || Number(permeateValue) > 10) && permeateValue !== '' && permeateValue !== null && (
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
                                : (data?.control == 'pH' || data?.control == 'TDS (CCP2)') ?
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
                                                                        Feed
                                                                        {data?.control == 'pH' ?
                                                                            <>
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`6.5 - 8.5`})
                                                                                </span>
                                                                                {(Number(feedValue) < 6.5 || Number(feedValue) > 8.5) && feedValue !== '' && feedValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</>
                                                                            : data?.control == 'TDS (CCP2)' ?
                                                                                <>
                                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                        ({`< 300 ppm`})
                                                                                    </span>
                                                                                    {(Number(feedValue) > 300) && feedValue !== '' && feedValue !== null && (
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
                                                                            : data?.control == 'TDS (CCP2)' ?
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
                                                                            : data?.control == 'TDS (CCP2)' ?
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
                                    : <></>}
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
