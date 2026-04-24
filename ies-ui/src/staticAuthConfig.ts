/**
 * Set to true to use a static mock user (no Keycloak, no backend auth).
 * Use this for frontend-only development (UI/layout design).
 * Set back to false when you want to integrate with real auth again.
 *
 * You can also enable via env: set USE_STATIC_AUTH=true in .env.local
 * (requires config to define it; see docs/STATIC-AUTH-SETUP.md).
 */
export const USE_STATIC_AUTH = false;

/**
 * Static user used when USE_STATIC_AUTH is true.
 * ROLE_ADMIN gives full access so all menus and permission checks pass.
 */
export const STATIC_CURRENT_USER: API.CurrentUser = {
  name: 'Static Dev User',
  login: 'static-dev',
  firstName: 'Static',
  lastName: 'Dev',
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  email: 'static-dev@local.dev',
  authorities: ['ROLE_ADMIN'] as unknown as [],
  groupAttributeMap: {} as API.CurrentUser['groupAttributeMap'],
};
