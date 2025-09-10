import { Button, Card } from "antd";
import { DNList } from "./data";
import { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

interface FloatingCardProps {
    selectedRows: DNList[];
    cardOpen: { visible: boolean };
}

export const FloatingCard = ({
    selectedRows,
    cardOpen,
}: FloatingCardProps) => {
    if (!cardOpen.visible || selectedRows.length === 0) return null
    const [collapsed, setCollapsed] = useState(false);
    return (
        <Card
            size="small"
            style={{
                position: "fixed",
                right: 40,
                bottom: 20,
                width: 250,
                maxHeight: "50vh",
                overflowY: collapsed ? "hidden" : "auto",
                zIndex: 1000,
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            }}
            bodyStyle={{ padding: 0 }}
        >
            {/* Header row with collapse button */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                    color: "gray",
                    borderBottom: "1px solid #f0f0f0",
                    padding: "4px 8px",
                    cursor: "pointer",
                }}
                onClick={() => setCollapsed((prev) => !prev)}
            >
                <span style={{ flex: 1 }}>SKU</span>
                <span style={{ marginLeft: 8 , marginRight: 10}}>Qty</span>
                {collapsed ? <UpOutlined /> : <DownOutlined />}
            </div>

            {!collapsed && (() => {
                const allItems = selectedRows.flatMap((row) => row.mergeItems);

                // group by sku_id + uom for category 2
                const grouped: Record<
                    string,
                    { sku_id: string; sku_name: string; qty: number; category: number; sequence: string }
                > = {};

                allItems.forEach((item) => {
                    const baseKey = item.sku_id ?? String(item.itemCode);
                    const baseName = item.sku_name ?? "Unknown SKU";

                    const key =
                        Number(item.category) === 2 ? `${baseKey}-${item.sku_uom}` : baseKey;
                    const name =
                        Number(item.category) === 2 && item.sku_uom
                            ? `${baseName} - ${item.sku_uom}`
                            : baseName;

                    if (!grouped[key]) {
                        grouped[key] = {
                            sku_id: key,
                            sku_name: name,
                            qty: 0,
                            category: Number(item.category ?? 0),
                            sequence: item.sequence ?? "",
                        };
                    }
                    grouped[key].qty += Number(item.qty ?? 0);
                });

                // sort: first by category ascending, then by sku_id ascending
                const groupedItems = Object.values(grouped).sort((a, b) => {
                    if (a.category !== b.category) return a.category - b.category;
                    return a.sequence.localeCompare(b.sequence);
                });

                // calculate total volume
                const totalVolume = allItems.reduce(
                    (sum, item) => sum + Number(item.qty ?? 0),
                    0
                );

                return (
                    <>
                        {groupedItems.map((g) => (
                            <div
                                key={g.sku_id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                    padding: "4px 8px",
                                }}
                            >
                                <span style={{ flex: 1 }}>{g.sku_name}</span>
                                <span style={{ marginLeft: 8, marginRight: 20 }}>{g.qty}</span>
                            </div>
                        ))}

                        {/* Total Volume row */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontWeight: "bold",
                                color: "black",
                                borderTop: "1px solid #f0f0f0",
                                padding: "4px 8px",
                                marginTop: 8,
                            }}
                        >
                            <span style={{ flex: 1 }}>Total Volume</span>
                            <span style={{ marginLeft: 8 , marginRight: 10}}>{totalVolume}</span>
                        </div>
                    </>
                );
            })()}

            {/* Footer (always visible when collapsed) */}
            {collapsed && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        color: "black",
                        borderTop: "1px solid #f0f0f0",
                        padding: "4px 8px",
                        marginTop: 0,
                    }}
                >
                    <span style={{ flex: 1 }}>Total Volume</span>
                    <span style={{ marginLeft: 8, marginRight: 20 }}>
                        {selectedRows
                            .flatMap((row) => row.mergeItems)
                            .reduce((sum, item) => sum + Number(item.qty ?? 0), 0)}
                    </span>
                </div>
            )}
        </Card>
    );
};
