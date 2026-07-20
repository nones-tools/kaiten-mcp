import type { CliCommand } from '../interfaces/command.js';
import { assignCommand, cardCommand, cardsCommand, cardSimpleCommand, createCommand, deleteCommand, moveCommand, simpleCommand, updateCommand } from './commands/cards.js';
import { commentCommand } from './commands/comments.js';
import { gitBranchCommand, gitCheckoutCommand, gitCommitCommand, gitPushCommand, gitStatusCommand } from './commands/git.js';
import { helpCommand } from './commands/help.js';
import { boardCommand, columnCommand, userCommand } from './commands/navigation.js';
import { subtaskCommand } from './commands/subtasks.js';
import { findCommand, tagCommand } from './commands/tags.js';

/** Every CLI command, in help-text order. Adding a command = one entry here + its module. */
export const commands: CliCommand[] = [
  cardsCommand,
  cardCommand,
  simpleCommand,
  cardSimpleCommand,
  createCommand,
  updateCommand,
  deleteCommand,
  moveCommand,
  assignCommand,
  subtaskCommand,
  commentCommand,
  boardCommand,
  columnCommand,
  userCommand,
  tagCommand,
  findCommand,
  gitBranchCommand,
  gitCheckoutCommand,
  gitCommitCommand,
  gitPushCommand,
  gitStatusCommand,
  helpCommand,
];

/** Maps every command name and alias to its command. Later registrations do not silently override earlier ones. */
export function buildRegistry(list: CliCommand[] = commands): Map<string, CliCommand> {
  const registry = new Map<string, CliCommand>();
  for (const command of list) {
    for (const key of [command.name, ...(command.aliases ?? [])]) {
      if (registry.has(key)) {
        throw new Error(`Duplicate CLI command name or alias: ${key}`);
      }
      registry.set(key, command);
    }
  }
  return registry;
}
