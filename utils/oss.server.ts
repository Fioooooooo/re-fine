import OSS from 'ali-oss';

const client = new OSS({
  accessKeyId: process.env.OSS_ACCESS_KEY_ID as string,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET as string,
  region: process.env.OSS_REGION as string,
  bucket: useRuntimeConfig().ossBucket as string,
  endpoint: process.env.OSS_BUCKET as string,
});

export const ossPut = async (objectName: string, content: any): Promise<string> => {
  try {
    const result = await client.put(objectName, content)
    return result.url;
  } catch (e) {
    console.error(e);
    return '';
  }
}

export const stsToken = async () => {
  const sts = new OSS.STS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID as string,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET as string,
  });

  const result = await sts.assumeRole(
    'acs:ram::1628604079888308:role/ram-oss',
    '',
    15 * 60,
    'refine-oss'
  );
  return result.credentials;
}