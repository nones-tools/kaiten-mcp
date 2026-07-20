import { KaitenSDKBase, type KaitenSDKOptions } from './sdk/base.js';
import { BoardsMixin } from './sdk/mixins/boards.js';
import { CardsMixin } from './sdk/mixins/cards.js';
import { ChecklistsMixin } from './sdk/mixins/checklists.js';
import { CommentsMixin } from './sdk/mixins/comments.js';
import { FilesMixin } from './sdk/mixins/files.js';
import { GitMixin } from './sdk/mixins/git.js';
import { HierarchyMixin } from './sdk/mixins/hierarchy.js';
import { TagsMixin } from './sdk/mixins/tags.js';
import { UsersMixin } from './sdk/mixins/users.js';

export type { KaitenSDKOptions } from './sdk/base.js';
export type { CreateCardInput } from './sdk/cards.js';
export type { TaskFlowTask } from './sdk/hierarchy.js';
export type { MinimalCard, MinimalParent, MinimalSubtask, TaggedCard } from './sdk/projections.js';

// Every actual SDK method is contributed by a mixin under `src/sdk/mixins/*`
// (each a thin one-line delegation into the matching `src/sdk/*` operation
// module); this file only composes them. Public method set/signatures are
// unchanged from the pre-restructure single-class KaitenSDK.
const ComposedSDK = ChecklistsMixin(
  FilesMixin(GitMixin(UsersMixin(BoardsMixin(CommentsMixin(HierarchyMixin(TagsMixin(CardsMixin(KaitenSDKBase))))))))
);

export class KaitenSDK extends ComposedSDK {}

export function createSDK(options?: KaitenSDKOptions): KaitenSDK {
  return new KaitenSDK(options);
}
