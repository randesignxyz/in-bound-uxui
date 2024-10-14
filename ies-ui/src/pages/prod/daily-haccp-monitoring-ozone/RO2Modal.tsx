import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { HACCPMonitoringOzoneList } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, message, Radio, Row, Typography } from 'antd';
import { useAccess } from '@umijs/max';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props extends FormModalProps {
    data?: HACCPMonitoringOzoneList
    type?: string
    onSave: (data: HACCPMonitoringOzoneList) => void
}
export default ({ data, onSave, type, ...props }: Props) => {
    const access = useAccess();
    const { Text } = Typography;
    const [form] = useForm<HACCPMonitoringOzoneList>();
    const [uv1, setuv1] = useState()
    const [uv2, setuv2] = useState()
    const [uv3, setuv3] = useState()
    const [uv4, setuv4] = useState()
    const [initData, setInitData] = useState<HACCPMonitoringOzoneList>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            form.resetFields();
            setuv1(data?.uv1)
            setuv2(data?.uv2)
            setuv3(data?.uv3)
            setuv4(data?.uv4)
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
                if (data?.control == 'Pressure (oPRP1)' || data?.control == 'Pressure (oPRP3)') {
                    if (parseFloat(dataForm.um1_filter) < 0.2 || parseFloat(dataForm.um1_filter) > 3.0) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.feed_array1) > 15.0) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.feed_array2) > 15.0) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 15.0) {
                        updatedWarningCount++;
                    }
                    if (data?.control == 'Pressure (oPRP3)') {
                        if (parseFloat(dataForm.um022_filter) < 0.2 || parseFloat(dataForm.um022_filter) > 3.0) {
                            updatedWarningCount++;
                        }
                    }
                }
                if (data?.control == 'ΔP (CCP3,4)' || data?.control == 'ΔP (CCP5,6)') {
                    if (parseFloat(dataForm.array1) > 3.5) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.array2) > 3.5) {
                        updatedWarningCount++;
                    }
                }
                if (type == 'Reverses Osmosis System (RO2)' && data?.control == 'Flow rate') {
                    if (parseFloat(dataForm.feed_ro) > 18) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 4) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) < 12 || parseFloat(dataForm.permeate) > 14) {
                        updatedWarningCount++;
                    }
                }
                if (type == 'Reverses Osmosis System (RO3)' && data?.control == 'Flow rate') {
                    if (parseFloat(dataForm.feed_ro) > 45) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 10) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.permeate) < 28 || parseFloat(dataForm.permeate) > 35) {
                        updatedWarningCount++;
                    }
                }

                if (data?.control == 'pH') {
                    if (parseFloat(dataForm.feed) < 6.5 || parseFloat(dataForm.feed) > 8.5) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.ro_buffer_tank) < 6.2) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) < 5.0 || parseFloat(dataForm.concentrate) > 9.0) {
                        updatedWarningCount++;
                    }
                }
                if (data?.control == 'TDS (CCP3)' || data?.control == 'TDS (CCP6)') {
                    if (parseFloat(dataForm.feed) > 300) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.ro_buffer_tank) > 30) {
                        updatedWarningCount++;
                    }
                    if (parseFloat(dataForm.concentrate) > 1000) {
                        updatedWarningCount++;
                    }
                }
                if (type == 'Reverses Osmosis System (RO2)' && data?.control == 'Ultraviolet (UV) (oPRP2)') {
                    if (uv1 == null) {
                        message.error('Please select UV1!')
                        return
                    }
                    if (uv2 == null) {
                        message.error('Please select UV2!')
                        return
                    }
                    if (uv1 == 0) {
                        updatedWarningCount++;
                    }
                    if (uv2 == 0) {
                        updatedWarningCount++;
                    }
                }
                if (type == 'Reverses Osmosis System (RO3)' && data?.control == 'Ultraviolet (UV) (oPRP4)') {
                    if (uv3 == null) {
                        message.error('Please select UV3!')
                        return
                    }
                    if (uv4 == null) {
                        message.error('Please select UV4!')
                        return
                    }
                    if (uv3 == 0) {
                        updatedWarningCount++;
                    }
                    if (uv4 == 0) {
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
                        uv1:uv1,
                        uv2:uv2,
                        uv3:uv3,
                        uv4:uv4
                    }
                } else {
                    const changes = [
                        initData?.um1_filter != dataForm.um1_filter ? `1µm Filter from ${initData?.um1_filter} to ${dataForm.um1_filter}` : '',
                        initData?.um022_filter != dataForm.um022_filter ? `0.22 µm Filter from ${initData?.um022_filter} to ${dataForm.um022_filter}` : '',
                        initData?.feed_array1 != dataForm.feed_array1 ? `Feed array 1 from ${initData?.feed_array1} to ${dataForm.feed_array1}` : '',
                        initData?.feed_array2 != dataForm.feed_array2 ? `Feed array 2 from ${initData?.feed_array2} to ${dataForm.feed_array2}` : '',
                        initData?.array1 != dataForm.array1 ? `Array 1 from ${initData?.array1} to ${dataForm.array1}` : '',
                        initData?.array2 != dataForm.array2 ? `Array 2 from ${initData?.array2} to ${dataForm.array2}` : '',
                        initData?.feed_ro != dataForm.feed_ro ? `Feed RO from ${initData?.feed_ro} to ${dataForm.feed_ro}` : '',
                        initData?.permeate != dataForm.permeate ? `Permeate from ${initData?.permeate} to ${dataForm.permeate}` : '',
                        initData?.ro_buffer_tank != dataForm.ro_buffer_tank ? `RO Buffer Tank from ${initData?.ro_buffer_tank} to ${dataForm.ro_buffer_tank}` : '',
                        initData?.feed != dataForm.feed ? `Feed from ${initData?.feed} to ${dataForm.feed}` : '',
                        initData?.concentrate != dataForm.concentrate ? `Concentrate from ${initData?.concentrate} to ${dataForm.concentrate}` : '',
                        initData?.uv1 != uv1 ? `UV1 from ${initData?.uv1 == '1' ? 'Yes' : 'No'} to ${uv1 == 1 ? 'Yes' : 'No'}` : '',
                        initData?.uv2 != uv2 ? `UV2 from ${initData?.uv2 == '1' ? 'Yes' : 'No'} to ${uv2 == 1 ? 'Yes' : 'No'}` : '',
                        initData?.uv3 != uv3 ? `UV3 from ${initData?.uv3 == '1' ? 'Yes' : 'No'} to ${uv3 == 1 ? 'Yes' : 'No'}` : '',
                        initData?.uv4 != uv4 ? `UV4 from ${initData?.uv4 == '1' ? 'Yes' : 'No'} to ${uv4 == 1 ? 'Yes' : 'No'}` : '',
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
                        uv1:uv1,
                        uv2:uv2,
                        uv3:uv3,
                        uv4:uv4
                    }
                }
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    {data?.control == 'Pressure (oPRP1)' || data?.control == 'Pressure (oPRP3)' ?
                        <>
                            <Row gutter={6}>
                                <Col span={12}>
                                    <ProFormText
                                        hasFeedback={false}
                                        rules={[{ required: true, message: 'Please Enter 1µm Filter' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                        label={
                                            <ProForm.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.um1_filter !== currentValues.um1_filter}
                                            >
                                                {({ getFieldValue }) => {
                                                    const um1FilterValue = getFieldValue('um1_filter');
                                                    return (
                                                        <div>
                                                            1µm Filter
                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                ({`0.2 - 3.0 bar`})
                                                            </span>
                                                            {(Number(um1FilterValue) < 0.2 || Number(um1FilterValue) > 3.0) && um1FilterValue !== '' && um1FilterValue !== null && (
                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            </ProForm.Item>
                                        }
                                        name={'um1_filter'}
                                        initialValue={data?.um1_filter}
                                        fieldProps={{
                                            type: 'number',
                                            step: 'any'
                                        }}
                                    />
                                </Col>
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

                            </Row>
                            <Row gutter={6}>
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
                            </Row>
                            {type == 'Reverses Osmosis System (RO2)' ?
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
                                : type == 'Reverses Osmosis System (RO3)' ?
                                    <Row gutter={6}>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter 0.22 µm Filter' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.um022_filter !== currentValues.um022_filter}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const um022FilterValue = getFieldValue('um022_filter');
                                                            return (
                                                                <div>
                                                                    0.22 µm Filter
                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                        ({`0.2 - 3.0 bar`})
                                                                    </span>
                                                                    {(Number(um022FilterValue) < 0.2 || Number(um022FilterValue) > 3.0) && um022FilterValue !== '' && um022FilterValue !== null && (
                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'um022_filter'}
                                                initialValue={data?.um022_filter}
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
                                    </Row> : <></>}
                        </>
                        : (data?.control == 'ΔP (CCP5,6)' || data?.control == 'ΔP (CCP3,4)') ?
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
                                                                    {type == 'Reverses Osmosis System (RO2)' ?
                                                                        <><span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 18 m³/h`})
                                                                        </span>
                                                                            {(Number(feedROValue) > 18) && feedROValue !== '' && feedROValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : type == 'Reverses Osmosis System (RO3)' ?
                                                                            <><span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`< 45 m³/h`})
                                                                            </span>
                                                                                {(Number(feedROValue) > 45) && feedROValue !== '' && feedROValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> :
                                                                            <></>}
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
                                                                    {type == 'Reverses Osmosis System (RO2)' ?
                                                                        <><span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`< 4 m³/h`})
                                                                        </span>
                                                                            {(Number(concentrateValue) > 4) && concentrateValue !== '' && concentrateValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : type == 'Reverses Osmosis System (RO3)' ?
                                                                            <><span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`< 10 m³/h`})
                                                                            </span>
                                                                                {(Number(concentrateValue) > 10) && concentrateValue !== '' && concentrateValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> :
                                                                            <></>}
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
                                                                    {type == 'Reverses Osmosis System (RO2)' ?
                                                                        <><span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                            ({`12 - 14 m³/h`})
                                                                        </span>
                                                                            {(Number(permeateValue) < 12 || Number(permeateValue) > 14) && permeateValue !== '' && permeateValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}</>
                                                                        : type == 'Reverses Osmosis System (RO3)' ?
                                                                            <><span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`28 - 35 m³/h`})
                                                                            </span>
                                                                                {(Number(permeateValue) < 28 || Number(permeateValue) > 35) && permeateValue !== '' && permeateValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</> :
                                                                            <></>}
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
                                : (data?.control == 'pH' || data?.control == 'TDS (CCP6)' || data?.control == 'TDS (CCP3)') ?
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
                                                                            : data?.control == 'TDS (CCP6)' || data?.control == 'TDS (CCP3)' ?
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
                                                    rules={[{ required: true, message: 'Please Enter RO Buffer Tank' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.ro_buffer_tank !== currentValues.ro_buffer_tank}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const roBufferTankValue = getFieldValue('ro_buffer_tank');
                                                                return (
                                                                    <div>
                                                                        RO Buffer Tank
                                                                        {data?.control == 'pH' ?
                                                                            <>
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`> 6.2`})
                                                                                </span>
                                                                                {(Number(roBufferTankValue) < 6.2) && roBufferTankValue !== '' && roBufferTankValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</>
                                                                            : data?.control == 'TDS (CCP6)' || data?.control == 'TDS (CCP3)' ?
                                                                                <>
                                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                        ({`< 30 ppm`})
                                                                                    </span>
                                                                                    {(Number(roBufferTankValue) > 30) && roBufferTankValue !== '' && roBufferTankValue !== null && (
                                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                    )}</> : <></>}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'ro_buffer_tank'}
                                                    initialValue={data?.ro_buffer_tank}
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
                                                                            : data?.control == 'TDS (CCP6)' || data?.control == 'TDS (CCP3)' ?
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
                                    : type == 'Reverses Osmosis System (RO2)' ?
                                        (data?.control == 'Ultraviolet (UV) (oPRP2)') ?
                                            <>
                                                <Row gutter={6}>
                                                    <Col span={12}>
                                                        <div style={{ flexDirection: 'row' }}>
                                                            <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                                            <Text style={{ marginBottom: 10 }}>UV1</Text>
                                                            {(uv1 == 0 || data?.uv1 == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                                                        </div>
                                                        <Radio.Group
                                                            defaultValue={data?.uv1 == '1' ? '1' : data?.uv1 == '0' ? '0' : ''}
                                                            // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                                            onChange={(e) => (setuv1(e.target.value))}
                                                        >
                                                            <Radio value='1'>Yes</Radio>
                                                            <Radio value="0">No</Radio>
                                                        </Radio.Group>
                                                    </Col>
                                                    <Col span={12}>
                                                        <div style={{ flexDirection: 'row' }}>
                                                            <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                                            <Text style={{ marginBottom: 10 }}>UV2</Text>
                                                            {(uv2 == 0 || data?.uv2 == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                                                        </div>
                                                        <Radio.Group
                                                            defaultValue={data?.uv2 == '1' ? '1' : data?.uv2 == '0' ? '0' : ''}
                                                            // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                                            onChange={(e) => (setuv2(e.target.value))}
                                                        >
                                                            <Radio value='1'>Yes</Radio>
                                                            <Radio value="0">No</Radio>
                                                        </Radio.Group>
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
                                            </> :
                                            <></>
                                            : type == 'Reverses Osmosis System (RO3)' ?
                                                (data?.control == 'Ultraviolet (UV) (oPRP4)') ?
                                                    <>
                                                        <Row gutter={6}>
                                                            <Col span={12}>
                                                                <div style={{ flexDirection: 'row' }}>
                                                                    <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                                                    <Text style={{ marginBottom: 10 }}>UV3</Text>
                                                                    {(uv3 == 0 || data?.uv3 == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                                                                </div>
                                                                <Radio.Group
                                                                    defaultValue={data?.uv3 == '1' ? '1' : data?.uv3 == '0' ? '0' : ''}
                                                                    // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                                                    onChange={(e) => (setuv3(e.target.value))}
                                                                >
                                                                    <Radio value='1'>Yes</Radio>
                                                                    <Radio value="0">No</Radio>
                                                                </Radio.Group>
                                                            </Col>
                                                            <Col span={12}>
                                                                <div style={{ flexDirection: 'row' }}>
                                                                    <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                                                    <Text style={{ marginBottom: 10 }}>UV4</Text>
                                                                    {(uv4 == 0 || data?.uv4 == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                                                                </div>
                                                                <Radio.Group
                                                                    defaultValue={data?.uv4 == '1' ? '1' : data?.uv4 == '0' ? '0' : ''}
                                                                    // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                                                    onChange={(e) => (setuv4(e.target.value))}
                                                                >
                                                                    <Radio value='1'>Yes</Radio>
                                                                    <Radio value="0">No</Radio>
                                                                </Radio.Group>
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
                                                    </> : <></>
                                                : <></>}
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
