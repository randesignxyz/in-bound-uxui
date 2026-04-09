import FormModalComp from "@/components/FormModal";
import { EditableProTable, ProColumns } from "@ant-design/pro-components";
import { useState, useEffect } from "react";
import TextArea from "antd/es/input/TextArea";
import SparePartImage from "../spare-part-request/SparePartImage";
import { Form, Modal, message } from "antd";

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
  const [remarkError, setRemarkError] = useState<string>("");

  const toSafeInt = (value: unknown) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.trunc(num));
  };

  const normalizeItems = (items: any[] = []) =>
    items.map((item) => {
      const availableQty = toSafeInt(item.availableQty);
      const returnQty = item.return_quantity == null ? (availableQty > 0 ? 1 : 0) : toSafeInt(item.return_quantity);
      const usedQty = item.used_quantity == null ? 0 : toSafeInt(item.used_quantity);

      return {
        ...item,
        return_quantity: returnQty,
        used_quantity: usedQty,
        reason: item.reason ?? "",
        UoM: item.UoM ?? "pcs",
      };
    });

  // Reset table state whenever the modal is opened with selected items
  useEffect(() => {
    if (!open) {
      return;
    }

    const nextItems = normalizeItems(data ?? []);
    setDataSource(nextItems);
    setEditableRowKeys(nextItems.map((item) => item.id));
    setRemark("");
    setRemarkError("");
  }, [open, data]);

  const updateItems = (items: any[]) => {
    setDataSource(items);
    onItemsChange?.(items);
  };

  const sanitizeItems = (items: any[]) =>
    items.map((item) => ({
      ...item,
      return_quantity: toSafeInt(item.return_quantity),
      used_quantity: toSafeInt(item.used_quantity),
    }));

  const validateItems = (items: any[]) => {
    const seenFulfillmentLineIds = new Set<string>();

    for (const item of items) {
      const qtyToReturn = toSafeInt(item.return_quantity);
      const qtyUsed = toSafeInt(item.used_quantity);
      const availableQty = toSafeInt(item.availableQty);
      const totalHandled = qtyToReturn + qtyUsed;

      // Handle comma-separated fulfillmentLineIds (e.g., "1018,1019")
      const fulfillmentLineIdStr = String(item.fulfillmentLineId).trim();
      if (fulfillmentLineIdStr) {
        const firstId = fulfillmentLineIdStr.split(',')[0].trim();
        if (Number.isFinite(Number(firstId))) {
          if (seenFulfillmentLineIds.has(fulfillmentLineIdStr)) {
            return `Duplicate fulfillment line selected: ${fulfillmentLineIdStr}.`;
          }
          seenFulfillmentLineIds.add(fulfillmentLineIdStr);
        }
      }

      if (totalHandled <= 0) {
        return `Please enter quantity for ${item.part_number || item.itemId || "selected item"}.`;
      }

      if (totalHandled > availableQty) {
        return `Quantity for ${item.part_number || item.itemId || "selected item"} exceeds available (${availableQty}).`;
      }
    }

    return null;
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
        title: "Category",
        dataIndex: "category",
      editable: false,
    },
    {
      title: "Available Qty",
      dataIndex: "availableQty",
      width: 120,
      valueType: "digit",
      editable: false,
    },
    {
      title: "QTY to Return",
      dataIndex: "return_quantity",
      width: 120,
      valueType: "digit",
      fieldProps: {
        min: 0,
        precision: 0,
      },
    },
    {
      title: "Used QTY",
      dataIndex: "used_quantity",
      width: 120,
      valueType: "digit",
      fieldProps: {
        min: 0,
        precision: 0,
      },
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
    setRemarkError("");
    onCancel();
  };

  const handleSubmit = () => {
    // Validate remark is not empty
    if (!remark || remark.trim() === "") {
      setRemarkError("Remark is required");
      return;
    }

    const validationError = validateItems(dataSource);
    if (validationError) {
      message.error(validationError);
      return;
    }

    setRemarkError("");
    Modal.confirm({
    title: "Submit return request",
    content: "Are you sure you want to submit this return request?",
    okText: "Yes",
    cancelText: "No",
    okType: "primary",
    onOk: () => {
      onSubmit({
        remark,
        items: dataSource,
      });
    },
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
        onChange={(value) => updateItems(sanitizeItems([...value]))}
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
              sanitizeItems(dataSource.map((item) =>
                item.id === rowKey ? { ...item, ...data } : item
              ))
            );
          },
          onValuesChange: (_, recordList) => {
            updateItems(sanitizeItems([...recordList]));
          },
        }}
      />

      <Form.Item
        label={
          <span>
            Remark Required{" "}
            <span style={{ color: "#ff4d4f" }}>*</span>
          </span>
        }
        validateStatus={remarkError ? "error" : ""}
        help={remarkError || ""}
        style={{ marginTop: 16 }}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <TextArea
          rows={4}
          maxLength={1000}
          value={remark}
          onChange={(e) => {
            setRemark(e.target.value);
            // Clear error as soon as user starts typing
            if (e.target.value.trim() !== "") {
              setRemarkError("");
            }
          }}
          onBlur={() => {
            if (!remark || remark.trim() === "") {
              setRemarkError("Remark is required");
            }
          }}
          status={remarkError ? "error" : ""}
          placeholder="Enter remark (required)"
        />
      </Form.Item>
    </FormModalComp>
  );
}
