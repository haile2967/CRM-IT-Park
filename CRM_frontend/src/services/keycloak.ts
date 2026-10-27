import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: (import.meta as any).env?.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: (import.meta as any).env?.VITE_KEYCLOAK_REALM || 'itpark-crm',
  clientId: (import.meta as any).env?.VITE_KEYCLOAK_CLIENT_ID || 'crm-frontend',
});

export default keycloak;
