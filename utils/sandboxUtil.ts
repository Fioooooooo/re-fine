import { Sandbox } from '@e2b/code-interpreter';

export const getSandbox = async (sandboxId: string | null | undefined, autoCreate?: boolean): Promise<Sandbox> => {
  let sandbox;

  try {
    sandbox = !!sandboxId ? await Sandbox.connect(sandboxId) : await Sandbox.create();
  } catch (error: Error | any) {
    if (error.message.startsWith('404') && autoCreate) {
      sandbox = await Sandbox.create();
    } else {
      throw error;
    }
  }

  await sandbox.setTimeout(10 * 60_000);
  return sandbox;
}