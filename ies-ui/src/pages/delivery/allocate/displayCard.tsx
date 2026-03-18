import { Card } from "antd";
import { DNList } from "./data";
import { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

interface FloatingCardProps {
  selectedRows?: DNList[];
  cardOpen: { visible: boolean };
}

export const FloatingCard = ({
  selectedRows,
  cardOpen,
}: FloatingCardProps) => {
  if (!cardOpen.visible || selectedRows?.length === 0) return null;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card
      size="small"
      style={{
        position: "fixed",
        right: 40,
        bottom: 20,
        width: 350,
        maxHeight: "50vh",
        overflowY: collapsed ? "hidden" : "auto",
        zIndex: 1000,
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
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
        <span style={{ width: 60, textAlign: "right", marginRight: 25 }}>Qty</span>
        <span style={{ width: 80, textAlign: "right" }}>Vol</span>
        <span style={{ width: 80, textAlign: "right" }}>Weight</span>
        {collapsed ? <UpOutlined /> : <DownOutlined />}
      </div>

      {!collapsed && (() => {
        const allItems = selectedRows?.flatMap((row) => row.mergeItems);

        // Group items
        const grouped: Record<
          string,
          {
            sku_id: string;
            sku_name: string;
            remaining_qty: number;
            category: number;
            sequence: string;
            totalVolume: number;
            totalWeight:number
          }
        > = {};

        allItems?.forEach((item) => {
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
              remaining_qty: 0,
              category: Number(item.category ?? 0),
              sequence: item.sequence ?? "",
              totalVolume: 0,
              totalWeight:0
            };
          }

          const remaining_qty = Number(item.remaining_qty ?? 0);
          const volume = Number(item.volume ?? 0);
          const weight = Number(item.weight ?? 0);
          grouped[key].remaining_qty += remaining_qty;
          grouped[key].totalVolume += remaining_qty * volume;
          grouped[key].totalWeight += remaining_qty * weight;
        });

        // Sort
        const groupedItems = Object.values(grouped).sort((a, b) => {
          if (a.category !== b.category) return a.category - b.category;
          return a.sequence.localeCompare(b.sequence);
        });

        // Totals
        const totalQty = allItems?.reduce(
          (sum, item) => sum + Number(item.remaining_qty ?? 0),
          0
        );
        const totalVolume = allItems?.reduce(
          (sum, item) => sum + Number(item.remaining_qty ?? 0) * Number(item.volume ?? 0),
          0
        );
        const totalWeight = allItems?.reduce(
          (sum, item) => sum + Number(item.remaining_qty ?? 0) * Number(item.weight ?? 0),
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
                <span style={{ width: 60, textAlign: "right", marginRight: 35 }}>{g.remaining_qty}</span>
                <span style={{ width: 80, textAlign: "right" }}>
                  {g.totalVolume.toFixed(2)} m³
                </span>
                <span style={{ width: 80, textAlign: "right" }}>
                  {g.totalWeight.toFixed(2)} Kg
                </span>
              </div>
            ))}

            {/* Footer aligned with same columns */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                color: "black",
                borderTop: "1px solid #f0f0f0",
                padding: "6px 8px",
                marginTop: 8,
              }}
            >
              <span style={{ flex: 1 }}>Total</span>
              <span style={{ width: 60, textAlign: "right", marginRight: 35 }}>{totalQty}</span>
              <span style={{ width: 80, textAlign: "right" }}>
                {totalVolume?.toFixed(2)} m³
              </span>
              <span style={{ width: 80, textAlign: "right" }}>
                {totalWeight?.toFixed(2)} Kg
              </span>
            </div>
          </>
        );
      })()}

      {/* Collapsed Footer */}
      {collapsed && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            color: "black",
            borderTop: "1px solid #f0f0f0",
            padding: "6px 8px",
          }}
        >
          <span style={{ flex: 1 }}>Total</span>
          <span style={{ width: 60, textAlign: "right", marginRight: 35 }}>
            {selectedRows
              ?.flatMap((row) => row.mergeItems)
              .reduce((sum, item) => sum + Number(item.remaining_qty ?? 0), 0)}
          </span>
          <span style={{ width: 80, textAlign: "right" }}>
            {selectedRows
              ?.flatMap((row) => row.mergeItems)
              .reduce(
                (sum, item) =>
                  sum + Number(item.remaining_qty ?? 0) * Number(item.volume ?? 0),
                0
              )
              .toFixed(2)}{" "}
            m³
          </span>
        </div>
      )}
    </Card>
  );
};
