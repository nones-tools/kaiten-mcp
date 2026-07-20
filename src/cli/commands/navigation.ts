import type { KaitenSDK } from '../../sdk.js';

type GetSdk = () => KaitenSDK;

export async function boardCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const spaceId = args[1] ? Number(args[1]) : null;
  const boards = await getSdk().getBoards(spaceId);
  console.log(JSON.stringify(boards, null, 2));
}

export async function columnCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const boardId = args[1];
  const columns = await getSdk().getColumns(Number(boardId));
  console.log(JSON.stringify(columns, null, 2));
}

export async function userCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const userQuery = args[1];
  if (userQuery) {
    const user = await getSdk().findUser(userQuery);
    console.log(JSON.stringify(user, null, 2));
  } else {
    const users = await getSdk().getUsers();
    console.log(JSON.stringify(users, null, 2));
  }
}
