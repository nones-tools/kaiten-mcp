import type { ToolDef } from '../../interfaces/tool.js';
import { cardTools, newCardTools } from './cards.js';
import { checklistTools } from './checklists.js';
import { commentTools, newCommentTools, tagTools } from './comments-tags.js';
import { fileTools } from './files.js';
import { gitTools } from './git.js';
import { hierarchyTools } from './hierarchy.js';
import { navigationTools, newNavigationTools } from './navigation.js';
import { userTools } from './users.js';

export type { ToolDef } from '../../interfaces/tool.js';

/**
 * Full tool registry, concatenated in EXACTLY the order the old monolithic
 * `mcp-server.js`/`mcp/tools.ts` registered them - tests assert this order.
 * The per-domain source files don't all read contiguously in that order
 * (comments/tags/hierarchy interleave), so the order is reconstructed here
 * rather than by file layout.
 *
 * 3.1.0 appends 6 additive tools (kaiten_lanes, kaiten_update_comment,
 * kaiten_delete_comment, kaiten_archive_card, kaiten_unarchive_card,
 * kaiten_unassign_card) after the original 39 - the legacy sequence above is
 * untouched, new tools are only ever appended at the end.
 */
export const tools: ToolDef[] = [
  ...navigationTools,
  ...cardTools,
  ...commentTools,
  ...hierarchyTools,
  ...tagTools,
  ...gitTools,
  ...userTools,
  ...checklistTools,
  ...fileTools,
  ...newNavigationTools,
  ...newCommentTools,
  ...newCardTools,
];
