import React, { useEffect } from 'react';
import { DrawerForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormSwitch, DrawerFormProps } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { generate3LetterCode, generateFullCode } from './treeUtils';
import numeral from 'numeral';
import { DataSetupService } from './service';
import { simpleRequestActions } from '@/services/model';

interface DataSetupItemFormProps extends DrawerFormProps {
    record?: any;
    parent?: any;
    lastRecord: Number;
}

const DataSetupItemForm: React.FC<DataSetupItemFormProps> = ({ record, parent, lastRecord, ...props }) => {
    const [form] = Form.useForm();
    const requestAction = simpleRequestActions();
    useEffect(() => {
        props.open && form.resetFields();
        record && form.setFieldsValue(record);
    }, [props.open]);

    const lastNumber = String(Number(lastRecord ?? 0) + 1).padStart(3, '0');

    return (
        <DrawerForm
            {...props}
            form={form}
            autoFocusFirstInput
            submitter={{
                searchConfig: {
                    submitText: 'Save',
                    resetText: 'Cancel',
                },
            }}
        >
            <ProFormText
                name="code"
                label="Code"
                disabled={record?.id}
                placeholder="e.g. ITEM_CODE"
                initialValue={generate3LetterCode(parent?.name || 'ITEM',) + '-' + lastNumber}
                rules={[{ required: true, message: 'Please enter a code' }]}
                transform={(value) => value ? value.toUpperCase().replace(/\s+/g, '_') : ''}
            />

            <ProFormText
                name="nameEn"
                label="Name (EN)"
                placeholder="English Name"
                rules={[{ required: true, message: 'Please enter English name' }]}
            />
            <ProFormText
                name="nameKm"
                label="Name (KM)"
                placeholder="Khmer Name"
            />

            <ProFormTextArea
                name="descriptionEn"
                label="Description (EN)"
                placeholder="English Description"
                fieldProps={{
                    rows: 8
                }}
            />

            <ProFormTextArea
                name="descriptionKm"
                label="Description (KM)"
                placeholder="Khmer Description"
                fieldProps={{
                    rows: 8
                }}
            />

            <ProFormSelect
                name="status"
                label="Status"
                valueEnum={{
                    Active: 'Active',
                    Inactive: 'Inactive'
                }}
                initialValue="Active"
                rules={[{ required: true }]}
            />

            <ProFormSwitch
                name="setDefault"
                label="Set Default"
            />

            <ProFormSelect
                initialValue="All"
                name="access"
                mode='tags'
                label="Access (Optional)"
                options={[
                    { label: 'All', value: 'All' },
                    { label: 'Manager', value: 'Manager' },
                    { label: 'Employee', value: 'Employee' },
                    { label: 'Admin', value: 'Admin' },
                    { label: 'User', value: 'User' },
                ]}
            />

            <ProFormSelect
                name="map"
                mode='tags'
                label="Map (Optional)"
                request={async ({ keywords }) => {
                    const data = await DataSetupService.pageDataSetupItems({ criteria: { searchValue: keywords } })
                    return data?.items?.map((item) => ({ label: `${item.code}`, value: item.code }));
                }}
            />
        </DrawerForm>
    );
};

export default DataSetupItemForm;
