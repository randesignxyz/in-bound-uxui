/**
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    '/api/': {
      // target: 'http://[::1]:8080',
      target: 'http://10.0.12.247:85',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/services': {
      // target: 'http://[::1]:8080',
      target: 'http://10.0.12.247:85',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  test: {

  },
  pre: {
  },
};
