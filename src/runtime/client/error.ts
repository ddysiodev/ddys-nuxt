export class DdysError extends Error {
  status: number;
  method: string;
  path: string;
  detail?: unknown;

  constructor(message: string, status = 0, method = 'GET', path = '/', detail?: unknown) {
    super(message);
    this.name = 'DdysError';
    this.status = status;
    this.method = method;
    this.path = path;
    this.detail = detail;
  }
}
