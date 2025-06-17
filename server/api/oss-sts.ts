import { stsToken } from "~/utils/oss.server";

export default defineLazyEventHandler(async () => {

  return defineEventHandler(async (event: any) => {
    const result = await stsToken();

    return {
      accessKeyId: result.AccessKeyId,
      accessKeySecret: result.AccessKeySecret,
      securityToken: result.SecurityToken,
      durationSeconds: result.Expiration,
      region: process.env.OSS_REGION,
      endpoint: process.env.OSS_ENDPOINT,
      bucket: process.env.OSS_BUCKET
    }
  });

});