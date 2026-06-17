import "server-only";

import * as s3 from "./s3";

export const storage = {
  put: s3.put,
  get: s3.get,
  remove: s3.remove,
};
