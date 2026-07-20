import type { ToolDef } from '../../interfaces/tool.js';
import { cardTools } from './cards.js';
import { checklistTools } from './checklists.js';
import { commentTools, tagTools } from './comments-tags.js';
import { fileTools } from './files.js';
import { gitTools } from './git.js';
import { hierarchyTools } from './hierarchy.js';
import { navigationTools } from './navigation.js';
import { userTools } from './users.js';

export type { ToolDef } from '../../interfaces/tool.js';

/**
 * Full tool registry, concatenated in EXACTLY the order the old monolithic
 * `mcp-server.js`/`mcp/tools.ts` registered them - tests assert this order.
 * The per-domain source files don't all read contiguously in that order
 * (comments/tags/hierarchy interleave), so the order is reconstructed here
 * rather than by file layout.
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
];
