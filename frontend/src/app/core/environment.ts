// Every service imports from here — switching environments
// (local vs. AWS) requires changing only this file.

export const environment = {
  production: false,
  apiBaseUrl: 'http://52.23.239.170:8080',
  apiUrl: 'http://52.23.239.170:8080/api'
};
