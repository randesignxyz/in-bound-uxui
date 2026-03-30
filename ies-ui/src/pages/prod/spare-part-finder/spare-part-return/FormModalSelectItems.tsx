import FormModalComp from "@/components/FormModal";
import { EditableProTable, ProColumns } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import TextArea from "antd/es/input/TextArea";
import SparePartImage from "../spare-part-request/SparePartImage";

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: { remark: string; items: any[] }) => void;
  onItemsChange?: (items: any[]) => void;
  data?: any[];
}

export default function FormModalSelectItems({
  open,
  onCancel,
  onSubmit,
  onItemsChange,
  data,
}: FormModalProps) {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [remark, setRemark] = useState<string>("");

  const normalizeItems = (items: any[] = []) =>
    items.map((item) => ({
      ...item,
      return_quantity: item.return_quantity ?? 1,
      used_quantity: item.used_quantity ?? 0,
      reason: item.reason ?? "",
      UoM: item.UoM ?? "pcs",
    }));

  // Reset table state whenever the modal is opened with selected items
  useEffect(() => {
    if (!open) {
      return;
    }

    const nextItems = normalizeItems(data ?? []);
    setDataSource(nextItems);
    setEditableRowKeys(nextItems.map((item) => item.id));
  }, [open, data]);

  const updateItems = (items: any[]) => {
    setDataSource(items);
    onItemsChange?.(items);
  };

  const columns: ProColumns<any>[] = [
    {
      title: "Image",
      dataIndex: "image",
      editable: false,
      width: 80,
      render: (_, record) => (
      <SparePartImage
          imageId={record.imageId}
          src={record.image}
          alt={record.partName || record.productId}
          size={48}
          />
     ),
    },
    {
      title: "Product Number",
      dataIndex: "part_number",
      editable: false,
    },
    {
      title: "Name",
      dataIndex: "spare_part_name",
      editable: false,
    },
    {
      title: "Type",
      dataIndex: "type",
      editable: false,
    },
    {
      title: "Category",
      dataIndex: "category",
      editable: false,
    },
    {
       title: "QTY to Pick",
      dataIndex: "quantity",
      width: 120,
      valueType: "digit",
      editable: false,
    },

    {
      title: "QTY to Return",
      dataIndex: "return_quantity",
      width: 120,
      valueType: "digit",
    },
    {
      title: "Used QTY",
      dataIndex: "used_quantity",
      width: 120,
      valueType: "digit",
    },
    {
      title: "UoM",
      dataIndex: "UoM",
      width: 120,
      editable: false,
    },
  {
  title: "Remark",
  dataIndex: "reason",
  width: 200,
  render: (_, record) => {
    return record.reason;
  },
  renderFormItem: (_, { record }) => {
    return (
      <TextArea
        rows={1}
        defaultValue={record?.reason}
        placeholder="Enter reason for return"
      />
    );
  },
},
    {
      title: "Action",
      valueType: "option",
      width: 160,
      render: (_, record) => [
        <a
          key="remove"
          onClick={() => {
            const newData = dataSource.filter((item) => item.id !== record.id);
            updateItems(newData);
            setEditableRowKeys(newData.map((item) => item.id));
          }}
        >
          <span style={{ color: "#ff4d4f" }}>Remove</span>
        </a>,
      ],
    },
  ];

  const handleCancel = () => {
    onCancel();
  };

  const handleSubmit = () => {
    onSubmit({
      remark,
      items: dataSource,
    });
  };

  return (
    <FormModalComp
      title="Return Spare Parts"
      open={open}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      width="90%"
    >
      <EditableProTable
        rowKey="id"
        columns={columns}
        value={dataSource}
        onChange={(value) => updateItems([...value])}
        recordCreatorProps={false}
        editable={{
          type: "multiple",
          editableKeys,
          onChange: setEditableRowKeys,
          actionRender: (row) => [
            <a
              key="remove"
              onClick={() => {
                const newData = dataSource.filter(
                  (item) => item.id !== row.id
                );
                updateItems(newData);
                setEditableRowKeys(newData.map((item) => item.id));
              }}
            >
              <span style={{ color: "#ff4d4f" }}>Remove</span>
            </a>,
          ],
          onSave: async (rowKey, data) => {
            updateItems(
              dataSource.map((item) =>
                item.id === rowKey ? { ...item, ...data } : item
              )
            );
          },
          onValuesChange: (_, recordList) => {
            updateItems([...recordList]);
          },
        }}
      />

      <label>Remark (optional)</label>
      <TextArea
        rows={4}
        maxLength={200}
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />
    </FormModalComp>
  );
}
