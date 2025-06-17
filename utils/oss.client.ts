import OSS from 'ali-oss';

let client: OSS | null = null;

export const getClient = async (): Promise<OSS> => {
  if (client) {
    return client;
  }

  const stsTokenConfig = await $fetch('/api/oss-sts');

  return new OSS({
    accessKeyId: stsTokenConfig.accessKeyId || '',
    accessKeySecret:stsTokenConfig.accessKeySecret || '',
    region: stsTokenConfig.region || '',
    bucket: stsTokenConfig.bucket || '',
    endpoint: stsTokenConfig.endpoint || '',
    stsToken: stsTokenConfig.securityToken || '',
    refreshSTSTokenInterval: 13 * 60 * 1000,
    refreshSTSToken: async () => {
      const stsToken = await $fetch('/api/oss-sts');
      return {
        accessKeyId: stsToken.accessKeyId,
        accessKeySecret: stsToken.accessKeySecret,
        stsToken: stsToken.securityToken
      }
    },
  });
};