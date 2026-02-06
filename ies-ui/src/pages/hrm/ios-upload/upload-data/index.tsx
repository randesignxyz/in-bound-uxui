import { commitImportedData } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { DataResponse, ImportDataItem } from "@/services/shared/data";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import {
  Alert,
  Checkbox,
  Modal,
  ModalProps,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";

const { Text } = Typography;

type Props = ModalProps & {
  datasources?: DataResponse<ImportDataItem>;
  onFinish: () => void;
};

export default ({ datasources, onFinish, ...rest }: Props) => {
  const [dataValidation, setDataValidation] = useState(0);
  const [importedData, setImportedData] =
    useState<DataResponse<ImportDataItem>>();
  const [data, setData] = useState<ImportDataItem[]>([]);
  const [commited, setCommited] = useState(false);
  const [submited, setSubmited] = useState(false);

  const requestActions = simpleRequestActions();

  const init = (items?: ImportDataItem[], submittedFlag?: boolean) => {
    const itemList = items ?? datasources?.items ?? [];

    setSubmited(!!submittedFlag);
    setCommited(false);

    if (datasources?.id) {
      setImportedData({ id: datasources.id, items: itemList });
    }

    setData(
      itemList.map((it, index) => ({
        ...it,
        key: `${datasources?.id}-${index}`,
      }))
    );

    setDataValidation(
      itemList.filter((it) =>
        it.fieldInfoList?.some((f) => f.isFailed)
      ).length
    );
  };

  useEffect(() => {
    if (!rest.open) return;
    init();
  }, [rest.open]);

  const renderCol = (
    title: string,
    fixed?: boolean
  ): ProColumns<ImportDataItem> => ({
    title,
    fixed,
    render: (_, record) => {
      const field = record.fieldInfoList?.find(
        (f) => f.fieldDisplay === title
      );

      if (!field) return <Text type="secondary">N/A</Text>;

      if (field.isFailed) {
        const color = field.isWarning ? "gold" : "red"; // warning vs error
        return (
          <Tooltip color={color} title={field.message}>
            <Text type={field.isWarning ? "warning" : "danger"}>
              {field.fieldValue || "N/A"}
            </Text>
          </Tooltip>
        );
      }


      return field.fieldValue ?? "—";
    },
  });

  const displayFields = [
    "Employee ID",
    "Full Name (EN)",
    "Company",
    "Location",
    "Function",
    "Sub-Function",
    "Position",
    "Job Level",
    "Start Date",
    "Probation End Date",
    "LM1 ID",
    "LM1 Name",
    "LM2/FM ID",
    "LM2/FM Name",
    "Remark"
  ];

  return (
    <Modal
      width={1700}
      {...rest}
      okText="Commit"
      cancelText="Close"
      maskClosable={false}
      okButtonProps={{
        disabled: dataValidation > 0 || commited || submited,
      }}
      onOk={() => {
        if (submited) {
          message.warning("Imported data is already committed.");
          return;
        }

        if (dataValidation > 0) {
          message.error("Please resolve all remaining issues");
          return;
        }

        Modal.confirm({
          title: "Commit imported data",
          content: "Are you sure?",
          onOk: async () => {
            try {
              if (!datasources) return;

              const rs = await commitImportedData<ImportDataItem>(
                "IMPORT_EMPLOYEE_IPO",
                datasources.id
              )(requestActions);

              message.success("Data committed.");
              setCommited(true);
              init(rs.items, true);
              onFinish();
            } catch (error: any) {
              setCommited(false);
              message.error(error?.message || "Commit failed");
            }
          },
        });
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {dataValidation > 0 && (
          <Alert
            type="error"
            showIcon
            message={`${dataValidation} record${
              dataValidation > 1 ? "s" : ""
            } is invalid to import.`}
            action={
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setData(
                      importedData?.items?.filter((it) =>
                        it.fieldInfoList?.some((f) => f.isFailed)
                      ) || []
                    );
                  } else {
                    setData(importedData?.items || []);
                  }
                }}
              >
                Reveal
              </Checkbox>
            }
          />
        )}
      </Space>

      <ProTable<ImportDataItem>
        rowKey="key"
        search={false}
        options={false}
        scroll={{ x: true }}
        dataSource={data}
        columns={[
          ...displayFields.map((f) =>
            renderCol(f, f === "Employee ID")
          ),
          {
            title: "Status",
            render: (_, r) => {
              const failed = r.fieldInfoList?.some((f) => f.isFailed);
              return (
                <Text type={failed ? "danger" : "success"}>
                  {commited
                    ? "Committed"
                    : failed
                      ? "Error"
                      : r.action}
                </Text>
              );
            },
          },
          {
            title: "Message",
            render: (_, r) =>
              r.fieldInfoList
                ?.filter((f) => f.isFailed)
                .map((f) => `${f.fieldDisplay}: ${f.message}`)
                .join(", "),
          },
        ]}
      />
    </Modal>
  );
};
