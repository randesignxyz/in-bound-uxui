

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
   Label formatter
   =========================== */
const formatLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/* ===========================
   Render object block (CARD)
   =========================== */
const renderObjectBlock = (obj: any, index?: number) => {
  const header =
    obj?.itemCode ||
    obj?.itemName ||
    (index !== undefined ? `Item ${index + 1}` : "Item");

  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 4,
        padding: "6px 8px",
        marginBottom: 6,            // 🔽 small spacing
        background: "#fafafa",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 12,
          marginBottom: 4,          // 🔽 small spacing
        }}
      >
        {header}
      </div>

      {Object.entries(obj).map(([key, value]) => (
        <div
          key={key}
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 2,        // 🔽 compact rows
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              minWidth: 130,
              fontWeight: 500,
              color: "#595959",
            }}
          >
            {formatLabel(key)} :
          </div>
          <div>
            {typeof value === "object"
              ? renderValue(value)
              : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ===========================
   Value renderer (NO JSON)
   =========================== */
const renderValue = (val: any) => {
  if (val === null || val === undefined) {
    return <span style={{ opacity: 0.6 }}>null</span>;
  }

  // Primitive
  if (typeof val !== "object") {
    return <span>{String(val)}</span>;
  }

  // Array → each item separated
  if (Array.isArray(val)) {
    return (
      <div>
        {val.map((item, index) =>
          typeof item === "object" ? (
            <div key={index}>
              {renderObjectBlock(item, index)}
            </div>
          ) : (
            <div key={index}>{String(item)}</div>
          )
        )}
      </div>
    );
  }

  // Object
  return renderObjectBlock(val);
};

/* ===========================
   OLD | NEW view
   =========================== */
const renderSideBySide = (oldVal: any, newVal: any) => {

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,                     // 🔽 smaller gap
      }}
    >
      <div style={{ color: "#cf1322" }}>
        {renderValue(oldVal)}
      </div>
      <div style={{ color: "#389e0d" }}>
        {renderValue(newVal)}
      </div>
    </div>
  )
};

/* ===========================
   Diff object (ONLY changed)
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
        <Panel
          header={formatLabel(key)}
          key={key}
        >
          {renderSideBySide(oldObj?.[key], newObj?.[key])}
        </Panel>
      );
    })
    .filter(Boolean);

  if (!panels.length) return null;

  return (
    <Collapse
      bordered={false}
      size="small"
      defaultActiveKey={panels.map((p: any) => p.key)}
    >
      {panels}
    </Collapse>
  );
};

/* ===========================
   Diff array by ID
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
          header={
            newItem.itemCode ||
            newItem.itemName ||
            `Item ${newItem[idKey]}`
          }
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
      size="small"
      defaultActiveKey={panels.map((p: any) => p.key)}
    >
      {panels}
    </Collapse>
  );
};

/* ===========================
   MAIN EXPORT
   =========================== */
export const renderDiffOnly = (oldVal: any, newVal: any) => {
  if (isEqual(oldVal, newVal)) return null;

  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    return diffArrayById(oldVal, newVal, "id");
  }

  if (
    typeof oldVal === "object" &&
    typeof newVal === "object"
  ) {
    return diffObject(oldVal, newVal);
  }

  return renderSideBySide(oldVal, newVal);
};
