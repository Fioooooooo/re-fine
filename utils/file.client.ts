import { getClient } from '~/utils/oss.client';

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

export const isNewFile = (file: File, existFiles: File[]) => {
  if (existFiles.length === 0) {
    return true;
  }

  return !existFiles.some(
    f => f.name === file.name && f.size === file.size && f.type === file.type
  );
};

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const putOssFiles = async (files: File[], callback: (uploadedFile: UploadedFile) => void) => {
  if (files.length === 0) {
    return;
  }

  const ossClient = await getClient();

  await Promise.all(
    files.map(async f => {
      const result = await ossClient.put(`chat/user_id/conversation_id/${f.name}`, f);
      callback({
        url: result.url,
        name: f.name,
        type: f.type,
        size: f.size,
      });
    })
  );
}
