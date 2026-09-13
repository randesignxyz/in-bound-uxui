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
    const [uv5, setuv5] = useState()
    const [uv6, setuv6] = useState()
    const [initData, setInitData] = useState<HACCPMonitoringOzoneList>()

    useEffect(() => {
        if (props.open) {
            setInitData(data)
            form.resetFields();
            setuv5(data?.uv5)
            setuv6(data?.uv6)
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
                if (type == 'Ozone System (RO3)') {
                    if (data?.control == 'Pressure') {
                        if (parseFloat(dataForm.um022_filter) < 0.2 || parseFloat(dataForm.um022_filter) > 3.0) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'TDS') {
                        if (parseFloat(dataForm.mixed_tank) >= 30) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'pH') {
                        if (parseFloat(dataForm.mixed_tank) < 6.5 || parseFloat(dataForm.mixed_tank) > 8.5) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'Ozone (CCP9.1)') {
                        if (parseFloat(dataForm.o3_mixed_tank) < 0.1 || parseFloat(dataForm.o3_mixed_tank) > 0.4) {
                            updatedWarningCount++;
                        }
                    }
                } else if (type == 'Ozone System (RO4)') {
                    if (data?.control == 'Pressure') {
                        if (parseFloat(dataForm.air_supply_ps002) < 6.5 || parseFloat(dataForm.air_supply_ps002) > 8) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'TDS') {
                        if (parseFloat(dataForm.mixed_pipe) >= 30) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'pH') {
                        if (parseFloat(dataForm.mixed_pipe) < 6.5 || parseFloat(dataForm.mixed_pipe) > 8.5) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'Temperature (°C)') {
                        if (parseFloat(dataForm.chiller_tt302) < 5 || parseFloat(dataForm.chiller_tt302) > 25) {
                            updatedWarningCount++;
                        }
                        if (parseFloat(dataForm.controller) < 25 || parseFloat(dataForm.controller) > 35) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'Ozone (CCP9)') {
                        if (parseFloat(dataForm.o3_a143) < 0.1 || parseFloat(dataForm.o3_a143) > 0.4) {
                            updatedWarningCount++;
                        }
                    }
                    if (data?.control == 'UV Light (oPRP6)') {
                        if (uv5 == null) {
                            message.error('Please select UV5!')
                            return
                        }
                        if (uv6 == null) {
                            message.error('Please select UV6!')
                            return
                        }
                        if (uv5 == 0) {
                            updatedWarningCount++;
                        }
                        if (uv6 == 0) {
                            updatedWarningCount++;
                        }
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
                        uv5: uv5,
                        uv6: uv6
                    }
                } else {
                    const changes = [
                        initData?.um022_filter != dataForm.um022_filter ? `0.22 µm Filter from ${initData?.um022_filter} to ${dataForm.um022_filter}` : '',
                        initData?.mixed_tank != dataForm.mixed_tank ? `Mixed Tank from ${initData?.mixed_tank} to ${dataForm.mixed_tank}` : '',
                        initData?.o3_mixed_tank != dataForm.o3_mixed_tank ? `O3 Mixed Tank from ${initData?.o3_mixed_tank} to ${dataForm.o3_mixed_tank}` : '',
                        initData?.air_supply_ps002 != dataForm.air_supply_ps002 ? `Air Supply PS002 from ${initData?.air_supply_ps002} to ${dataForm.air_supply_ps002}` : '',
                        initData?.mixed_pipe != dataForm.mixed_pipe ? `Mixed Pipe from ${initData?.mixed_pipe} to ${dataForm.mixed_pipe}` : '',
                        initData?.chiller_tt302 != dataForm.chiller_tt302 ? `Chiller TT302 from ${initData?.chiller_tt302} to ${dataForm.chiller_tt302}` : '',
                        initData?.controller != dataForm.controller ? `Conroller from ${initData?.controller} to ${dataForm.controller}` : '',
                        initData?.o3_a143 != dataForm.o3_a143 ? `O₃ A143 from ${initData?.o3_a143} to ${dataForm.o3_a143}` : '',
                        initData?.uv5 != uv5 ? `UV5 from ${initData?.uv5 == '1' ? 'Yes' : 'No'} to ${uv5 == 1 ? 'Yes' : 'No'}` : '',
                        initData?.uv6 != uv6 ? `UV6 from ${initData?.uv6 == '1' ? 'Yes' : 'No'} to ${uv6 == 1 ? 'Yes' : 'No'}` : '',
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
                        uv5: uv5,
                        uv6: uv6
                    }
                }
                onSave(entity)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    {type == 'Ozone System (RO3)' ?
                        <>
                            {data?.control == 'Pressure' ?
                                <><Row gutter={6}>
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
                                </Row>
                                </>
                                : (data?.control == 'pH' || data?.control == 'TDS') ?
                                    <>
                                        <Row gutter={6}>
                                            <Col span={12}>
                                                <ProFormText
                                                    hasFeedback={false}
                                                    rules={[{ required: true, message: 'Please Enter Mixed Tank' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                    label={
                                                        <ProForm.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => prevValues.mixed_tank !== currentValues.mixed_tank}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const mixedTankValue = getFieldValue('mixed_tank');
                                                                return (
                                                                    <div>
                                                                        Mixed Tank
                                                                        {data?.control == 'pH' ?
                                                                            <>
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`6.5 - 8.5`})
                                                                                </span>
                                                                                {(Number(mixedTankValue) < 6.5 || (Number(mixedTankValue) > 8.5)) && mixedTankValue !== '' && mixedTankValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}</>
                                                                            : data?.control == 'TDS' ?
                                                                                <>
                                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                        ({`≤ 30 ppm`})
                                                                                    </span>
                                                                                    {(Number(mixedTankValue) >= 30) && mixedTankValue !== '' && mixedTankValue !== null && (
                                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                    )}</> : <></>}
                                                                    </div>
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    }
                                                    name={'mixed_tank'}
                                                    initialValue={data?.mixed_tank}
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
                                    </> : (data?.control == 'Ozone (CCP9.1)') ?
                                        <>
                                            <Row gutter={6}>
                                                <Col span={12}>
                                                    <ProFormText
                                                        hasFeedback={false}
                                                        rules={[{ required: true, message: 'Please Enter O3 Mixed Tank' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                        label={
                                                            <ProForm.Item
                                                                noStyle
                                                                shouldUpdate={(prevValues, currentValues) => prevValues.o3_mixed_tank !== currentValues.o3_mixed_tank}
                                                            >
                                                                {({ getFieldValue }) => {
                                                                    const o3mixedTankValue = getFieldValue('o3_mixed_tank');
                                                                    return (
                                                                        <div>
                                                                            O3 Mixed Tank
                                                                            <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                ({`0.1 - 0.4 ppm`})
                                                                            </span>
                                                                            {(Number(o3mixedTankValue) < 0.1 || Number(o3mixedTankValue) > 0.4) && o3mixedTankValue !== '' && o3mixedTankValue !== null && (
                                                                                <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }}
                                                            </ProForm.Item>
                                                        }
                                                        name={'o3_mixed_tank'}
                                                        initialValue={data?.o3_mixed_tank}
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
                                        </> : <></>}
                        </>
                        : (type == 'Ozone System (RO4)') ?
                            <>
                                {data?.control == 'Pressure' ?
                                    <><Row gutter={6}>
                                        <Col span={12}>
                                            <ProFormText
                                                hasFeedback={false}
                                                rules={[{ required: true, message: 'Please Enter Air supply PS002' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                label={
                                                    <ProForm.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.air_supply_ps002 !== currentValues.air_supply_ps002}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const airSupplyPs002Value = getFieldValue('air_supply_ps002');
                                                            return (
                                                                <div>
                                                                    Air supply PS002
                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                        ({`6.5 - 8 bar`})
                                                                    </span>
                                                                    {(Number(airSupplyPs002Value) < 6.5 || Number(airSupplyPs002Value) > 8) && airSupplyPs002Value !== '' && airSupplyPs002Value !== null && (
                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    </ProForm.Item>
                                                }
                                                name={'air_supply_ps002'}
                                                initialValue={data?.air_supply_ps002}
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
                                    : (data?.control == 'pH' || data?.control == 'TDS') ?
                                        <>
                                            <Row gutter={6}>
                                                <Col span={12}>
                                                    <ProFormText
                                                        hasFeedback={false}
                                                        rules={[{ required: true, message: 'Please Enter Mixed Pipe' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                        label={
                                                            <ProForm.Item
                                                                noStyle
                                                                shouldUpdate={(prevValues, currentValues) => prevValues.mixed_pipe !== currentValues.mixed_pipe}
                                                            >
                                                                {({ getFieldValue }) => {
                                                                    const mixedPipeValue = getFieldValue('mixed_pipe');
                                                                    return (
                                                                        <div>
                                                                            Mixed Pipe
                                                                            {data?.control == 'pH' ?
                                                                                <>
                                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                        ({`6.5 - 8.5`})
                                                                                    </span>
                                                                                    {(Number(mixedPipeValue) < 6.5 || (Number(mixedPipeValue) > 8.5)) && mixedPipeValue !== '' && mixedPipeValue !== null && (
                                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                    )}</>
                                                                                : data?.control == 'TDS' ?
                                                                                    <>
                                                                                        <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                            ({`≤ 30 ppm`})
                                                                                        </span>
                                                                                        {(Number(mixedPipeValue) >= 30) && mixedPipeValue !== '' && mixedPipeValue !== null && (
                                                                                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                        )}</> : <></>}
                                                                        </div>
                                                                    );
                                                                }}
                                                            </ProForm.Item>
                                                        }
                                                        name={'mixed_pipe'}
                                                        initialValue={data?.mixed_pipe}
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
                                        </> : (data?.control == 'Temperature (°C)') ?
                                            <>
                                                <Row gutter={6}>
                                                    <Col span={12}>
                                                        <ProFormText
                                                            hasFeedback={false}
                                                            rules={[{ required: true, message: 'Please Enter Chiller TT302' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                            label={
                                                                <ProForm.Item
                                                                    noStyle
                                                                    shouldUpdate={(prevValues, currentValues) => prevValues.chiller_tt302 !== currentValues.chiller_tt302}
                                                                >
                                                                    {({ getFieldValue }) => {
                                                                        const chillertt302Value = getFieldValue('chiller_tt302');
                                                                        return (
                                                                            <div>
                                                                                Chiller TT302
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`5 - 25 °C`})
                                                                                </span>
                                                                                {(Number(chillertt302Value) < 5 || Number(chillertt302Value) > 25) && chillertt302Value !== '' && chillertt302Value !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </ProForm.Item>
                                                            }
                                                            name={'chiller_tt302'}
                                                            initialValue={data?.chiller_tt302}
                                                            fieldProps={{
                                                                type: 'number',
                                                                step: 'any'
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <ProFormText
                                                            hasFeedback={false}
                                                            rules={[{ required: true, message: 'Please Enter Controller' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                            label={
                                                                <ProForm.Item
                                                                    noStyle
                                                                    shouldUpdate={(prevValues, currentValues) => prevValues.controller !== currentValues.controller}
                                                                >
                                                                    {({ getFieldValue }) => {
                                                                        const controllerValue = getFieldValue('controller');
                                                                        return (
                                                                            <div>
                                                                                Controller
                                                                                <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                    ({`25 - 35 °C`})
                                                                                </span>
                                                                                {(Number(controllerValue) < 25 || Number(controllerValue) > 35) && controllerValue !== '' && controllerValue !== null && (
                                                                                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </ProForm.Item>
                                                            }
                                                            name={'controller'}
                                                            initialValue={data?.controller}
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
                                            </> : (data?.control == 'Ozone (CCP9)') ?
                                                <>
                                                    <Row gutter={6}>
                                                        <Col span={12}>
                                                            <ProFormText
                                                                hasFeedback={false}
                                                                rules={[{ required: true, message: 'Please Enter O₃ A143' }, { pattern: /^\d*\.?\d+$/, message: 'Please enter a valid number' }]}
                                                                label={
                                                                    <ProForm.Item
                                                                        noStyle
                                                                        shouldUpdate={(prevValues, currentValues) => prevValues.o3_a143 !== currentValues.o3_a143}
                                                                    >
                                                                        {({ getFieldValue }) => {
                                                                            const o3a143Value = getFieldValue('o3_a143');
                                                                            return (
                                                                                <div>
                                                                                    O₃ A143
                                                                                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '5px' }}>
                                                                                        ({`0.1 - 0.4 ppm`})
                                                                                    </span>
                                                                                    {(Number(o3a143Value) < 0.1 || Number(o3a143Value) > 0.4) && o3a143Value !== '' && o3a143Value !== null && (
                                                                                        <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} />
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }}
                                                                    </ProForm.Item>
                                                                }
                                                                name={'o3_a143'}
                                                                initialValue={data?.o3_a143}
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
                                                </> : (data?.control == 'UV Light (oPRP6)') ?
                                                    <>
                                                        <Row gutter={6}>
                                                            <Col span={12}>
                                                                <div style={{ flexDirection: 'row' }}>
                                                                    <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                                                    <Text style={{ marginBottom: 10 }}>UV(5) &gt; 65%</Text>
                                                                    {(uv5 == 0 || data?.uv5 == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                                                                </div>
                                                                <Radio.Group
                                                                    defaultValue={data?.uv5 == '1' ? '1' : data?.uv5 == '0' ? '0' : ''}
                                                                    // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                                                    onChange={(e) => (setuv5(e.target.value))}
                                                                >
                                                                    <Radio value='1'>Yes</Radio>
                                                                    <Radio value="0">No</Radio>
                                                                </Radio.Group>
                                                            </Col>
                                                            <Col span={12}>
                                                                <div style={{ flexDirection: 'row' }}>
                                                                    <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                                                    <Text style={{ marginBottom: 10 }}>UV(6) &gt; 65%</Text>
                                                                    {(uv6 == 0 || data?.uv6 == '0') ? <ExclamationCircleOutlined style={{ color: 'red', marginLeft: '5px' }} /> : <></>}
                                                                </div>
                                                                <Radio.Group
                                                                    defaultValue={data?.uv6 == '1' ? '1' : data?.uv6 == '0' ? '0' : ''}
                                                                    // value={data?.sf == '1' ? '1' : data?.sf == '0' ? '0' : ''}
                                                                    onChange={(e) => (setuv6(e.target.value))}
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
                                                    </> : <></>}
                            </>
                            : <></>
                    }
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
