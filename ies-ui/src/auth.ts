import Keycloak from "keycloak-js"
import { isOffline } from "./pages/utils"
import { message } from "antd"
import { queryCurrent } from "./services/user"

const protocal = window.location.protocol
const host = window.location.hostname
const port = window.location.port

const kc_production = 'http://10.0.8.215:8989/auth/'
const kc_qa = 'http://10.0.12.247:8989/auth/'
//New keycloak
const kc_local = 'http://localhost:8989/auth/'
// const kc_local = 'http://localhost:8989/auth/'
const pro_host_name = 'ies.vital.com.kh'
const pro_host_name1 = '10.0.8.215'
const qa_host_name = '10.0.12.247'
// const qa1_host_name = '10.0.8.209'

const keycloakUri = () => {
    if (window.location.hostname.includes(pro_host_name) || window.location.hostname.includes(pro_host_name1)) {
        return kc_production

    } else if (window.location.hostname.includes(qa_host_name)) {
        return kc_qa
    } else {
        return kc_local
    }
}

export const endpoint = (): {
    url: string;
    redirectUri: string;
} => {
    return {
        url: keycloakUri(),
        redirectUri: `${protocal}//${host}:${port}/`,
    };

};

export const Auth = {
    realm: 'workflow',
    clientId: 'web_app',
    ...endpoint(),
};

export const keycloak = async (sso?: boolean) => {
    if (isOffline()) return undefined

    const kc = new Keycloak({
        realm: Auth.realm,
        clientId: Auth.clientId,
        url: Auth.url,

    })



    kc.onTokenExpired = () => {
        message.error("Session expired")
    }


    await kc.init({
        checkLoginIframe: true,
        onLoad: 'login-required',
    });

    kc.token && localStorage.setItem('accessToken', kc.token);


    return kc
}

