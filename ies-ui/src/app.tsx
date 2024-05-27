import { Footer, AvatarDropdown, AvatarName } from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { getLocale, history, Link, setLocale } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from '../config/requestErrorConfig';
import React from 'react';
import { App } from 'antd';
import moment from 'moment';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/auth';
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  logout?: () => void;
  loading?: boolean;
}> {
  moment.locale('en');
  if (getLocale() !== 'en-US') {
    setLocale('en-US');
  }

  if (location.pathname.startsWith("/external")) {
    history.push(`${loginPath}/?path=${location.pathname}`);
  }

  return {
    currentUser: undefined,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {

  return {
    actionsRender: () => [
      //<Question key="doc" />, <SelectLang key="SelectLang" />
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown menu={true}>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: "Dev"
    },
    footerRender: () => <Footer />,
    onPageChange: async () => {
      const { location } = history;
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(`${loginPath}/?path=${location.pathname}`);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        <>
          <App>
            {children}
          </App>
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  ...errorConfig,
};