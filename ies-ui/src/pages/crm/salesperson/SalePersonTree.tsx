import { UserAddOutlined, UserSwitchOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Dropdown, Input, MenuProps, message, Modal, Space, Tree, Typography } from "antd";
import { DataNode } from "antd/es/tree";
import { useCallback, useMemo, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import SalespersonHeirarchyForm from "./SalespersonHeirarchyForm";
import { SalespersonOrgAPI } from "./service";
import AuditorForm from "./AuditorForm";

interface Props {
  data?: SalespersonOrg[];
  onLoadData: () => void
}

interface SalesOrgDataNode extends DataNode {
  key: number;
  title: string;
  position?: string;
  saleId?: number;
  children?: SalesOrgDataNode[];
  isMatch?: boolean;
  avatarTitle?: string;
  path?: string;
  parentId?: number;
  name: string;
}

function mapSalespersonToSalesOrgDataNode(salesperson: SalespersonOrg): SalesOrgDataNode {
  return {
    key: salesperson.id,
    title: salesperson.name || "Unknown",
    position: salesperson.position,
    saleId: salesperson.saleId,
    path: salesperson.path,
    parentId: salesperson.parentId,
    name: salesperson.name || "Unknown",
    // Optional properties like children, isMatch, avatarTitle left undefined
  };
}

// Optimized tree building with caching
function buildTree(nodes: SalespersonOrg[] = []): SalesOrgDataNode[] {
  // Transform all nodes to SalesOrgDataNode
  const transformedNodes: SalesOrgDataNode[] = nodes.map(mapSalespersonToSalesOrgDataNode);

  // Map to store nodes by their path
  const pathMap: { [path: string]: SalesOrgDataNode } = {};

  // First pass: Add all transformed nodes to the map
  for (const node of transformedNodes) {
    if (node.path) {
      pathMap[node.path] = node;
    }
  }

  // Second pass: Link children to their parents
  for (const node of transformedNodes) {
    if (node.path) {
      const pathSegments = node.path.split('-').filter(segment => segment !== '');
      if (pathSegments.length > 1) {
        // Calculate parent path by removing the last segment
        const parentPathSegments = pathSegments.slice(0, -1);
        const parentPath = '-' + parentPathSegments.join('-') + '-';

        // If parent exists in map, add current node as its child
        if (pathMap[parentPath]) {
          if (!pathMap[parentPath].children) {
            pathMap[parentPath].children = [];
          }
          pathMap[parentPath].children!.push(node);
        }
      }
    }
  }

  // Collect root nodes (nodes with only one segment in path)
  const roots: SalesOrgDataNode[] = [];
  for (const node of transformedNodes) {
    if (node.path) {
      const pathSegments = node.path.split('-').filter(segment => segment !== '');
      if (pathSegments.length === 1) {
        roots.push(node);
      }
    }
  }

  return roots;
}

const filterTree = (nodes: SalesOrgDataNode[], query: string): SalesOrgDataNode[] => {
  if (!query.trim()) return nodes;

  const lowerQuery = query.toLowerCase();

  const hasMatchingDescendant = (node: SalesOrgDataNode): boolean => {
    if (node.title.toLowerCase().includes(lowerQuery)) return true;
    if (!node.children) return false;
    return node.children.some(child => hasMatchingDescendant(child));
  };

  return nodes
    .map(node => {
      const matches = node.title.toLowerCase().includes(lowerQuery);
      const children = node.children ? filterTree(node.children, query) : [];
      const hasMatchingChild = children.length > 0;
      // Include node if it matches or has a matching descendant
      if (matches || hasMatchingChild) {
        return {
          ...node,
          children: matches && node.children
            ? node.children.map(child => ({ ...child })) // Include all children if parent matches
            : children, // Otherwise, use filtered children
          isMatch: matches,
        };
      }
      return null;
    })
    .filter(Boolean) as SalesOrgDataNode[];
};

// Optimized key extraction
const getAllKeys = (nodes: SalesOrgDataNode[]): number[] => {
  const keys: number[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const node = stack.pop()!;
    keys.push(node.key);
    if (node.children) stack.push(...node.children);
  }
  return keys;
};

// Memoized title renderer
const TitleRenderer = ({ item, itemsAction }: { item: SalesOrgDataNode; itemsAction: (item: SalesOrgDataNode) => MenuProps["items"] }) => {
  const styleMap = {
    SE: { border: "#e9925a", bg: "#e9925a" },
    Auditor: { border: "#41c7c8", bg: "#41c7c8" },
    default: { border: "#4081fd", bg: "#4081fd" },
  };
  const { border, bg } = styleMap[item.position as keyof typeof styleMap] || styleMap.default;

  return (
    <Dropdown
      trigger={["contextMenu"]}
      menu={{ items: itemsAction(item), style: { width: 200, float: "right" } }}
    >
      <div style={{
        margin: 5,
        borderRadius: 5,
        padding: "2px 5px",
        backgroundColor: "white",
        border: `1px solid ${border}`,
        borderTop: `3px solid ${border}`,
      }}>
        <Space align="baseline">
          <Avatar style={{ backgroundColor: bg, verticalAlign: "middle" }} size={24} gap={0}>
            {item.avatarTitle}
          </Avatar>
          <Typography.Title level={5}>{item.title}</Typography.Title>
          <Typography.Text type="secondary">{item.position}</Typography.Text>
        </Space>
      </div>
    </Dropdown>
  );
};

export default ({ data, onLoadData }: Props) => {
  const requestAction = simpleRequestActions();
  const [salespersonState, setSalespersonState] = useState<{
    visible?: { name: "MODAL"; payloads?: SalesOrgDataNode };
  }>();
  const originalTree = useMemo(() => buildTree(data), [data]);
  const allKeys = useMemo(() => getAllKeys(originalTree), [originalTree]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filteredTree = useMemo(() => filterTree(originalTree, searchQuery), [originalTree, searchQuery]);
  const filteredKeys = useMemo(() => getAllKeys(filteredTree), [filteredTree]);
  const [expandedKeys, setExpandedKeys] = useState<number[]>(allKeys);
  const [auditorState, setAuditorState] = useState<{ visible?: { name: "MODAL", payload?: SalesOrgDataNode } }>();
  const itemsAction = useCallback((item: SalesOrgDataNode): MenuProps["items"] => [
    {
      key: "add",
      label: "Add",
      icon: <UserAddOutlined />,
      onClick: () => {
        setSalespersonState({ visible: { name: "MODAL", payloads: item } })
      }
    },
    {
      key: "auditor",
      label: "Auditor",
      icon: <UserSwitchOutlined />,
      onClick: () => setAuditorState({ visible: { name: "MODAL", payload: item } })
    },
    { type: "divider" },
    {
      key: "remove",
      label: "Remove",
      danger: true,
      icon: <UserDeleteOutlined />,
      onClick: () => {
        Modal.confirm({
          title: "Remove Salesperson Org",
          content: "are you sure?",
          onOk: async () => {
            await SalespersonOrgAPI(requestAction).removeSalespersonOrg({ id: item.key });
            message.success("Success!");
            onLoadData?.()
          }
        })
      }
    },
  ], []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      setExpandedKeys(getAllKeys(filterTree(originalTree, value)));
    } else {
      setExpandedKeys(allKeys);
    }
  }, [allKeys, originalTree]);

  const handleExpandAll = useCallback(() => {
    setExpandedKeys(searchQuery ? filteredKeys : allKeys);
  }, [allKeys, filteredKeys, searchQuery]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys([]);
  }, []);

  const onExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys as number[]);
  }, []);

  const titleRender = useCallback((item: SalesOrgDataNode) => (
    <TitleRenderer item={item} itemsAction={itemsAction} />
  ), [itemsAction]);

  return (
    <>
      <Card
        size="small"
        title={
          <Space direction="horizontal">
            <Input.Search
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              allowClear
              style={{ width: 200 }}
            />
            <Button onClick={handleExpandAll}>Expand All</Button>
            <Button onClick={handleCollapseAll}>Collapse All</Button>
          </Space>
        }
      >
        <Tree
          showLine
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          itemHeight={10}
          treeData={filteredTree}
          titleRender={titleRender}
          // virtual // Enable virtualization
          height={700} // Set a fixed height for virtualization

        />
      </Card>
      <SalespersonHeirarchyForm
        open={salespersonState?.visible?.name === "MODAL"}
        data={salespersonState?.visible?.payloads as unknown as SalespersonOrg}
        onSave={(data1) => {
          Modal.confirm({
            title: "Add Salesperson",
            content: "are you sure?",
            onOk: async () => {
              await SalespersonOrgAPI(requestAction).addSalespersonOrg(data1);
              setSalespersonState({ visible: undefined });
              message.success("success");
              onLoadData();
            }
          });
        }}
        modalProps={{
          onCancel: () => setSalespersonState({ visible: undefined })
        }}
      />

      <AuditorForm
        open={auditorState?.visible?.name == "MODAL"}
        modalProps={{
          onCancel: () => setAuditorState({ visible: undefined })
        }}
        onSave={(data) => {
          Modal.confirm({
            content: "are you sure?",
            title: "",
            onOk: async () => {
              await SalespersonOrgAPI(requestAction).saveSaleOrgAuditor(data);
              setAuditorState({visible:undefined});
              message.success("Success!")
            }
          })
        }}
        data={auditorState?.visible?.payload}
      />
    </>
  );
};