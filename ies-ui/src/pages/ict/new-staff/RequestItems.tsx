import { EditableProTable, ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { ItemType } from "./ItNewStaffRequestForm";
import { Checkbox } from "antd";
import { useState } from "react";

export default ({
    title,
    data,
    onItemsChange,
}: {
    title: string;
    data: ItemType[];
    onItemsChange: (items: ItemType[]) => void

}) => {
    const [itemTaken, setItemTaken] = useState<number[]>([]);

    return <ProCard
        size="small"
        bordered
        title={title}
    >
        <EditableProTable<ItemType>
            recordCreatorProps={false}
            rowKey={'itemId'}
            showHeader={false}
            value={data}
            onValuesChange={(values,) => {
                const newData = values.map((it) => ({
                    ...it,
                    qty: it.qty || 1,
                    checked: itemTaken.some((i) => i == it.itemId),
                }));
                onItemsChange(newData);
            }}
            columns={[
                {
                    dataIndex: 'checked',
                    width: 30,
                    valueType: 'checkbox',

                    renderFormItem(_, config, form) {
                        return (
                            <Checkbox
                                key={`checked-${config.record?.itemId}`}
                                onChange={(e) => {
                                    if (
                                        e.target.checked &&
                                        !itemTaken.some((it) => it == config.record?.itemId)
                                    ) {
                                        setItemTaken([...itemTaken, config.record?.itemId || 0]);
                                    }
                                    if (!e.target.checked) {
                                        setItemTaken(itemTaken.filter((it) => it != config.record?.itemId));
                                    }

                                    form.setFieldValue(config.record?.itemId || '', {
                                        ...config.record,
                                        checked: e.target.checked,
                                    });
                                }}
                            />
                        );
                    },
                },
                { dataIndex: 'itemName', readonly: true, width: 300 },
                {
                    dataIndex: 'remarks',
                    valueType: 'textarea',
                    formItemProps(form, config) {
                        const item = form.getFieldValue(config.rowKey || '');
                        return { ...config.proFieldProps, hidden: !item?.checked };
                    },
                    fieldProps: { rows: 1, placeholder: 'Remarks' },
                },
            ]}
            editable={{
                editableKeys: data.map((it) => it.itemId),
                type: 'multiple',
            }}
        />


    </ProCard>
}