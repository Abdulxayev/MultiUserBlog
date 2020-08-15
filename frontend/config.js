import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const API = publicRuntimeConfig.Production
    ? publicRuntimeCOnfig.API_PRODUCTION
    : publicRuntimeConfig.API_DEVELOPMENT;

export const APP_NAME = publicRuntimeConfig.APP_NAME;

export const DOMAIN = publicRuntimeConfig.Production
    ? publicRuntimeConfig.DOMAIN_PRODUCTION
    : publicRuntimeConfig.DOMAIN_DEVELOPMENT; 

export const FB_APP_ID = publicRuntimeConfig.FB_APP_ID;
export const DISQUS_SHORTNAME = publicRuntimeCOnfig.DISQUS_SHORTNAME;
export const GOOGLE_CLIENT_ID = publicRuntimeCOnfig.GOOGLE_CLIENT_ID;
