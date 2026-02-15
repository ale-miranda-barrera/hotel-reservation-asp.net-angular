// src/app/core/environment.ts
//
// Single source of truth for the API base URL.
// Every service imports from here — switching environments
// (local vs. AWS) requires changing only this file.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5066',
  apiUrl: 'http://localhost:5066/api'
};
