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
export { httpClient };

export const api = {
  ...httpClient,
  ...backendApi,
};

