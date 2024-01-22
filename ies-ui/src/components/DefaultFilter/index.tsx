import { useEffect, useState } from 'react'
import { Select, Checkbox } from 'antd'
import Search from "antd/lib/input/Search";


export interface FilterItem {
  id: string,
  name: string
}

interface Props<T extends FilterItem> {
  defaultValue?:string;
  items: T[];
  isGlobal?: boolean;
  selectedItem?: T;
  onSearch: (data?: {isGlobal?: boolean, status?: string, searchValue?: string}) => void;
}

const DefaultFilterComp = <T extends FilterItem>({
  defaultValue,
  items,
  selectedItem,
  isGlobal,
  onSearch
}: Props<T>) => {

  return <div>
    <Select
      showSearch
      defaultValue = {defaultValue}
      value={selectedItem?.id}
      style={{ width: 200 }}
      placeholder="Filter Type"
      options = {items.map(it => {
        return {value: it.id, label: it.name}
      })}
      onSelect={(value: any) => onSearch({status: value})}/>
      
    <Search style={{ width: '272px', marginLeft: '16px' }} placeholder="Search" onSearch={value => onSearch({searchValue: value.trim()})} />
    {/* <Checkbox style={{ marginLeft: '16px' }} defaultChecked={isGlobal} onChange={e => onSearch({isGlobal: e.target.checked}) }>
      Global
      </Checkbox> */}
  </div>
}

export default DefaultFilterComp