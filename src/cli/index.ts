#!/usr/bin/env node

import { KaitenApiError } from '../kaiten/index.js';
import { createSDK, type KaitenSDK } from '../sdk.js';
import { assignCommand, cardCommand, cardsCommand, cardSimpleCommand, createCommand, deleteCommand, moveCommand, simpleCommand, updateCommand } from './commands/cards.js';
import { commentCommand } from './commands/comments.js';
import { gitBranchCommand, gitCheckoutCommand, gitCommitCommand, gitPushCommand, gitStatusCommand } from './commands/git.js';
import { boardCommand, columnCommand, userCommand } from './commands/navigation.js';
import { subtaskCommand } from './commands/subtasks.js';
import { findCommand, tagCommand } from './commands/tags.js';
import { HELP_TEXT } from './help.js';

const args = process.argv.slice(2);
const command = args[0];

// Config/SDK are constructed lazily (only inside command handlers that need
// them) so that `help` and unrecognized commands work without KAITEN_*
// credentials configured. The old CLI built these eagerly at module load,
// which meant `kaiten help` crashed if no config was present - that's the
// one behavioral fix in this port.
let cachedSdk: KaitenSDK | undefined;
function getSdk(): KaitenSDK {
  if (!cachedSdk) cachedSdk = createSDK();
  return cachedSdk;
}

async function main(): Promise<void> {
  try {
    switch (command) {
      case 'cards':
      case 'list-cards':
        await cardsCommand(args, getSdk);
        break;

      case 'card':
      case 'get-card':
        await cardCommand(args, getSdk);
        break;

      case 'simple':
        await simpleCommand(args, getSdk);
        break;

      case 'card-simple':
        await cardSimpleCommand(args, getSdk);
        break;

      case 'create':
        await createCommand(args, getSdk);
        break;

      case 'update':
        await updateCommand(args, getSdk);
        break;

      case 'delete':
        await deleteCommand(args, getSdk);
        break;

      case 'move':
        await moveCommand(args, getSdk);
        break;

      case 'assign':
        await assignCommand(args, getSdk);
        break;

      case 'subtask':
        await subtaskCommand(args, getSdk);
        break;

      case 'comment':
        await commentCommand(args, getSdk);
        break;

      case 'board':
        await boardCommand(args, getSdk);
        break;

      case 'column':
        await columnCommand(args, getSdk);
        break;

      case 'user':
        await userCommand(args, getSdk);
        break;

      case 'tag':
        await tagCommand(args, getSdk);
        break;

      case 'find':
        await findCommand(args, getSdk);
        break;

      case 'git-branch':
        await gitBranchCommand(args, getSdk);
        break;

      case 'git-checkout':
        await gitCheckoutCommand(args, getSdk);
        break;

      case 'git-commit':
        await gitCommitCommand(args, getSdk);
        break;

      case 'git-status':
        await gitStatusCommand(args, getSdk);
        break;

      case 'git-push':
        await gitPushCommand(args, getSdk);
        break;

      case 'help':
      case '--help':
      case '-h':
        console.log(HELP_TEXT);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "kaiten help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof KaitenApiError) {
      console.error('Error:', error.body ?? error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

main();
