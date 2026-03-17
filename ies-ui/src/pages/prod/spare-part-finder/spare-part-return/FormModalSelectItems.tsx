import FormModalComp from "@/components/FormModal";
import { EditableProTable, ProColumns } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import { Avatar } from "antd";
import TextArea from "antd/es/input/TextArea";

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (items: any[]) => void;
  data?: any[];
}

export default function FormModalSelectItems({
  open,
  onCancel,
  onSubmit,
  data,
}: FormModalProps) {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [remark, setRemark] = useState<string>("");

  // Initialize data
  useEffect(() => {
    if (data && data.length > 0) {
      const existingIds = new Set(dataSource.map((item) => item.id));

      const newItems = data
        .filter((item) => !existingIds.has(item.id))
        .map((item) => ({
          ...item,
          return_quantity: 1,
          used_quantity: 0,
          reason: "",
          UoM: "pcs",
        }));

      if (newItems.length > 0) {
        const merged = [...dataSource, ...newItems];
        setDataSource(merged);

        setEditableRowKeys((prev) => [
          ...prev,
          ...newItems.map((item) => item.id),
        ]);
      }
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: ProColumns<any>[] = [
    {
      title: "Image",
      dataIndex: "image",
      editable: false,
      width: 80,
      render: (_, record) => (
        <Avatar src={record.image} size={48} shape="square" />
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
      dataIndex: "spare_part_type",
      editable: false,
    },
    {
      title: "Category",
      dataIndex: "category",
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
      valueType: "select",
      valueEnum: {
        pcs: { text: "PCS" },
        box: { text: "BOX" },
        set: { text: "SET" },
        pack: { text: "PACK" },
        ctn: { text: "CTN" },
        l: { text: "L" },
        kg: { text: "KG" },
        rol: { text: "ROL" },
      },
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
      render: (_, record, __, action) => [
        <a key="edit" onClick={() => action?.startEditable?.(record.id)}>
          Edit
        </a>,
        <a
          key="delete"
          onClick={() => {
            const newData = dataSource.filter((item) => item.id !== record.id);
            setDataSource(newData);
            setEditableRowKeys(newData.map((item) => item.id));
          }}
        >
          <span style={{ color: "#ff4d4f" }}>Delete</span>
        </a>,
      ],
    },
  ];

  const handleCancel = () => {
    onCancel();
  };

  const handleSubmit = () => {
    onSubmit(dataSource);
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
        onChange={(value) => setDataSource([...value])}
        recordCreatorProps={false}
        editable={{
          type: "multiple",
          editableKeys,
          onChange: setEditableRowKeys,
          actionRender: (row, _, defaultDoms) => [
            defaultDoms.save,
            <a
              key="delete"
              onClick={() => {
                const newData = dataSource.filter(
                  (item) => item.id !== row.id
                );
                setDataSource(newData);
                setEditableRowKeys(newData.map((item) => item.id));
              }}
            >
              <span style={{ color: "#ff4d4f" }}>Delete</span>
            </a>,
          ],
          onSave: async (rowKey, data) => {
            setDataSource((prev) =>
              prev.map((item) =>
                item.id === rowKey ? { ...item, ...data } : item
              )
            );
          },
          onValuesChange: (_, recordList) => {
            setDataSource([...recordList]);
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