import React from 'react';
import APPDMS from './AppDMS';
export const DMSPaths = {
  dms: '/dms',
  folder: '/dms/folder',
  setting: '/dms/setting',
  document: '/dms/document',
  workspace: '/dms/workspace',
  contracts: "/dms/contracts",
  company: "/dms/company",
  
};

export default () => {
  return (
    <>
      <APPDMS />
    </>
  );
};
