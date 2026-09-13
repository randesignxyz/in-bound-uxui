import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ProFormSelectProps } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Checkbox, Col, Radio, Row, Space } from 'antd';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';

export namespace UIBuilder {
  export const createRadioGroup = (options?: { value: string | number; label: string }[]) => {
    return (
      <Radio.Group style={{ width: '850px' }}>
        <Row>
          {options?.map((it) => {
            return (
              <Col span={5} key={it.value}>
                <Radio style={{ lineHeight: '32px' }} value={it.value}>
                  {it.label}
                </Radio>
              </Col>
            );
          })}
        </Row>
      </Radio.Group>
    );
  };

  export const createCheckBoxGroup = (options?: { value: string | number; label: string }[]) => {
    return (
      <Checkbox.Group style={{ width: '850px' }}>
        <Row>
          {options?.map((it) => {
            return (
              <Col span={5} key={it.value}>
                <Checkbox style={{ lineHeight: '32px' }} value={it.value}>
                  {it.label}
                </Checkbox>
              </Col>
            );
          })}
        </Row>
      </Checkbox.Group>
    );
  };

  export const createFormListElements1 =
    (
      el: (field: FormListFieldData, index: number) => React.ReactNode,
      addNew?: (fields: FormListFieldData[]) => boolean | undefined,
      newRecord?: (index: number) => any,
      added?: () => void,
      lastItemRemovedOnly?: true,
    ) =>
    (
      fields: FormListFieldData[],
      operation: FormListOperation,
      meta: {
        errors: React.ReactNode[];
      },
    ) => {
      // if (fields.length == 0) operation.add()
      return fields.map((field, index) => {
        if (fields.length == 0) operation.add();
        return (
          <Row key={`row-0${index}`}>
            <Col key={`col-0${index}`} flex="Auto">
              <Space align="baseline" key={`layer-0${index}`} size="large">
                {el(field, index)}
                {addNew && (
                  <Space key={`layer-1${index}`}>
                    {((lastItemRemovedOnly && fields.length > 1 && fields.length == index + 1) ||
                      (!lastItemRemovedOnly && fields.length > 1)) && (
                      <a>
                        <MinusCircleOutlined onClick={() => operation.remove(field.name)} />
                      </a>
                    )}
                    {(fields.length == 0 || fields.length == index + 1) &&
                      (addNew ? addNew(fields) : true) && (
                        <a>
                          <PlusCircleOutlined
                            onClick={() => {
                              operation.add(newRecord?.(index) || {});
                              added?.();
                            }}
                          />
                        </a>
                      )}
                  </Space>
                )}
              </Space>
            </Col>
          </Row>
        );
      });
    };

  export const createFormListElements =
    (
      el: (field: FormListFieldData, index: number) => React.ReactNode,
      addNew?: (fields: FormListFieldData[]) => boolean | undefined,
      newRecord?: (index: number) => any,
      lastItemRemovedOnly?: true,
    ) =>
    (
      fields: FormListFieldData[],
      operation: FormListOperation,
      meta: {
        errors: React.ReactNode[];
      },
    ) => {
      // if (fields.length == 0) operation.add()
      return fields.map((field, index) => {
        if (fields.length == 0) operation.add();
        return (
          <Row key={`row-0${index}`}>
            <Col key={`col-0${index}`} flex="Auto">
              <Space key={`layer-0${index}`} size="large">
                {el(field, index)}
                {addNew && (
                  <Space key={`layer-1${index}`}>
                    {((lastItemRemovedOnly && fields.length > 1 && fields.length == index + 1) ||
                      (!lastItemRemovedOnly && fields.length > 1)) && (
                      <a>
                        <MinusCircleOutlined onClick={() => operation.remove(field.name)} />
                      </a>
                    )}
                    {(fields.length == 0 || fields.length == index + 1) &&
                      (addNew ? addNew(fields) : true) && (
                        <a>
                          <PlusCircleOutlined
                            onClick={() => {
                              operation.add(newRecord?.(index) || {});
                            }}
                          />
                        </a>
                      )}
                  </Space>
                )}
              </Space>
            </Col>
          </Row>
        );
      });
    };

  export const createFormListReadOnlyElements =
    (el: (field: FormListFieldData, index: number) => React.ReactNode) =>
    (
      fields: FormListFieldData[],
      operation: FormListOperation,
      meta: {
        errors: React.ReactNode[];
      },
    ) => {
      // if (fields.length == 0) operation.add()
      return fields.map((field, index) => {
        if (fields.length == 0) operation.add();
        return (
          <Row key={`row-0${index}`}>
            <Col key={`col-0${index}`} flex="Auto">
              <Space key={`layer-0${index}`} size="large">
                {el(field, index)}
              </Space>
            </Col>
          </Row>
        );
      });
    };

  export const createProFormSelect = (props: ProFormSelectProps) => (
    <ProFormSelect
      mode="multiple"
      {...props}
      showSearch
      fieldProps={{
        optionLabelProp: 'label',
        filterOption: (input, option) =>
          (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
      }}
    />
  );

  export const toOption = (data?: { id: number | string; name: string }[]) =>
    data?.map((it) => {
      return { value: it.id, label: it.name };
    });
}
