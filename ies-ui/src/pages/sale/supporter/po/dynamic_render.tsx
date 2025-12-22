import React from "react";
import { Collapse } from "antd";

const { Panel } = Collapse;

/* ===========================
   Deep equality
   =========================== */
export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isEqual(v, b[i]));
  }

  if (typeof a === "object" && a && b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (!isEqual(a[k], b[k])) return false;
    }
    return true;
  }

  return false;
};

/* ===========================
   Safe value renderer
   =========================== */
const renderValue = (val: any) => {
  if (val === null || val === undefined) return <i>null</i>;

  if (typeof val === "object") {
    return (
      <pre style={{ margin: 0 }}>
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }

  return <span>{String(val)}</span>;
};

/* ===========================
   OLD | NEW view
   =========================== */
const renderSideBySide = (oldVal: any, newVal: any) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    }}
  >
    <div style={{ color: "#cf1322" }}>{renderValue(oldVal)}</div>
    <div style={{ color: "#389e0d" }}>{renderValue(newVal)}</div>
  </div>
);

/* ===========================
   Diff object (ONLY changed fields)
   =========================== */
const diffObject = (oldObj: any, newObj: any) => {
  const keys = Object.keys({
    ...(oldObj || {}),
    ...(newObj || {}),
  });

  const panels = keys
    .map((key) => {
      if (isEqual(oldObj?.[key], newObj?.[key])) return null;

      return (
        <Panel header={key} key={key}>
          {renderSideBySide(oldObj?.[key], newObj?.[key])}
        </Panel>
      );
    })
    .filter(Boolean);

  if (!panels.length) return null;

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={panels.map((p: any) => p.key)} // 🔥 expand all by default
    >
      {panels}
    </Collapse>
  );
};

/* ===========================
   Diff array by ID (PO / Stock)
   =========================== */
const diffArrayById = (
  oldArr: any[] = [],
  newArr: any[] = [],
  idKey = "id"
) => {
  const panels = newArr
    .map((newItem) => {
      const oldItem = oldArr.find(
        (o) => o[idKey] === newItem[idKey]
      );

      if (!oldItem) return null;

      const diff = diffObject(oldItem, newItem);
      if (!diff) return null;

      return (
        <Panel
          key={newItem[idKey]}
          header={newItem.itemCode || newItem.itemName}
        >
          {diff}
        </Panel>
      );
    })
    .filter(Boolean);

  if (!panels.length) return null;

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={panels.map((p: any) => p.key)} // 🔥 expand all items
    >
      {panels}
    </Collapse>
  );
};

/* ===========================
   MAIN FUNCTION (USE THIS)
   =========================== */
export const renderDiffOnly = (oldVal: any, newVal: any) => {
  if (isEqual(oldVal, newVal)) return null;

  // Array (PurchaseOrderItems / Stock)
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    return diffArrayById(oldVal, newVal, "id");
  }

  // Object
  if (typeof oldVal === "object" && typeof newVal === "object") {
    return diffObject(oldVal, newVal);
  }

  // Primitive
  return renderSideBySide(oldVal, newVal);
};
