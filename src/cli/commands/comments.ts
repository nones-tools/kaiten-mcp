import type { KaitenSDK } from '../../sdk.js';

type GetSdk = () => KaitenSDK;

export async function commentCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const commentCmd = args[1];
  if (commentCmd === 'add') {
    const commentCardId = args[2];
    const commentText = args[3];
    const comment = await getSdk().addComment(Number(commentCardId), commentText as string);
    console.log(JSON.stringify(comment, null, 2));
  } else if (commentCmd === 'list') {
    const commentCardId = args[2];
    const comments = await getSdk().getComments(Number(commentCardId));
    console.log(JSON.stringify(comments, null, 2));
  }
}
