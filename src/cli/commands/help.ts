import type { CliCommand } from '../../interfaces/command.js';
import { HELP_TEXT } from '../help.js';

export const helpCommand: CliCommand = {
  name: 'help',
  aliases: ['--help', '-h'],
  async run() {
    console.log(HELP_TEXT);
  },
};
