import type { KaitenSDK } from '../../sdk.js';

type GetSdk = () => KaitenSDK;

export async function subtaskCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const subTaskCmd = args[1];
  if (subTaskCmd === 'create') {
    const parentCardId = args[2];
    const subtaskTitle = args[3];
    const subtask = await getSdk().createSubtask(Number(parentCardId), subtaskTitle as string);
    console.log(JSON.stringify(subtask, null, 2));
  } else if (subTaskCmd === 'list') {
    const parentCardId = args[2];
    const subtasks = await getSdk().getSubtasks(Number(parentCardId));
    console.log(JSON.stringify(subtasks, null, 2));
  }
}
