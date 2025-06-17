import OSS from 'ali-oss';

const client = new OSS({
  accessKeyId: process.env.OSS_ACCESS_KEY_ID as string,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET as string,
  region: process.env.OSS_REGION,
  bucket: process.env.OSS_BUCKET,
  endpoint: process.env.OSS_ENDPOINT,
});

export const putBuffer = async (objectName: string, buffer: Buffer): Promise<string> => {
  try {
    const result = await client.put(objectName, buffer)
    return result.url;
  } catch (e) {
    console.error(e);
    return '';
  }
}