import { httpClient } from './client';
import { backendApi } from './backend';

export * from './auth';
export * from './products';
export * from './customers';
export * from './orders';
export * from './suppliers';
export * from './expenses';
export * from './stock';
export * from './accounts';
export * from './analytics';
export * from './backend';
export * from './notifications';
export * from './logs';
export * from './settings';
export * from './todos';
export * from './cashRegister';
export { httpClient };

export const api = {
  ...httpClient,
  ...backendApi,
};

