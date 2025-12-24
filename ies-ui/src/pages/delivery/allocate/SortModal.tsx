import React from "react";
import { Modal, Select, Button, Space } from "antd";

export interface SortRule {
    field?: string;
    order?: "asc" | "desc";
}

interface SortModalProps {
    open: boolean;
    onClose: () => void;
    onApply: () => void;

    sortConfig: SortRule[];
    setSortConfig: React.Dispatch<React.SetStateAction<SortRule[]>>;

    columns: { title: string; dataIndex: string }[];
}

const SortModal: React.FC<SortModalProps> = ({
    open,
    onClose,
    onApply,
    sortConfig,
    setSortConfig,
    columns
}) => {
    return (
        <Modal
            title="Advanced Sorting"
            open={open}
            onCancel={onClose}
            onOk={onApply}
            width="500px"
        >
            {sortConfig.map((cfg, index) => (
                <Space key={index} style={{ marginBottom: 10 }}>
                    {/* Column Selection */}
                    <Select
                        placeholder="Select column"
                        value={cfg.field}
                        onChange={(val) => {
                            const newSort = [...sortConfig];
                            newSort[index].field = val;
                            setSortConfig(newSort);
                        }}
                        style={{ width: 200 }}
                        options={columns.map((c) => ({
                            label: c.title,
                            value: c.dataIndex
                        }))}
                    />

                    {/* Order Selection */}
                    <Select
                        placeholder="Order"
                        value={cfg.order}
                        onChange={(val) => {
                            const newSort = [...sortConfig];
                            newSort[index].order = val as "asc" | "desc";
                            setSortConfig(newSort);
                        }}
                        style={{ width: 130 }}
                        options={[
                            { label: "Ascending", value: "asc" },
                            { label: "Descending", value: "desc" }
                        ]}
                    />

                    {/* Add rule */}
                    {index === sortConfig.length - 1 && (
                        <Button
                            onClick={() =>
                                setSortConfig([
                                    ...sortConfig,
                                    { field: undefined, order: undefined }
                                ])
                            }
                        >
                            +
                        </Button>
                    )}

                    {/* Remove rule */}
                    {sortConfig.length > 1 && (
                        <Button
                            danger
                            onClick={() => {
                                const newSort = [...sortConfig];
                                newSort.splice(index, 1);
                                setSortConfig(newSort);
                            }}
                        >
                            -
                        </Button>
                    )}
                </Space>
            ))}
        </Modal>
    );
};

export default SortModal;
