import type { KaitenSDK } from '../../sdk.js';
import type { Card } from '../../kaiten/interfaces/card.js';
import { optimizeCard, optimizeCardDetails } from '../projections.js';

type GetSdk = () => KaitenSDK;

export async function cardsCommand(_args: string[], getSdk: GetSdk): Promise<void> {
  const cards = (await getSdk().getCards()) as Card[];
  const optimizedCards = cards.map(optimizeCard);
  console.log(JSON.stringify(optimizedCards, null, 2));
}

export async function cardCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const cardId = args[1];
  if (!cardId) {
    console.error('Error: Card ID required');
    process.exit(1);
  }
  const card = (await getSdk().getCard(Number(cardId))) as Card;
  const optimizedCard = optimizeCardDetails(card);
  console.log(JSON.stringify(optimizedCard, null, 2));
}

export async function simpleCommand(_args: string[], getSdk: GetSdk): Promise<void> {
  const sdk = getSdk();
  const simpleCards = (await sdk.getCards()) as Card[];
  console.log(`📋 Задачи в пространстве "${sdk.config.defaultSpaceId}":\n`);

  simpleCards.forEach((card, index) => {
    const c = card as Record<string, any>;
    const status = card.condition === 1 ? '✅' : '🗄️';
    const column = c.column?.title || 'Неизвестно';
    const board = c.board?.title || 'Неизвестно';
    const owner = c.owner?.full_name || 'Не назначен';

    console.log(`${index + 1}. ${status} [${card.id}] ${card.title}`);
    console.log(`   📁 ${board} → ${column} | 👤 ${owner}`);
    if (c.size) console.log(`   ⏱️ Размер: ${c.size}`);
    console.log();
  });
  console.log(`Всего задач: ${simpleCards.length}`);
}

export async function cardSimpleCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const simpleCardId = args[1];
  if (!simpleCardId) {
    console.error('Error: Card ID required');
    process.exit(1);
  }
  const detailedCard = (await getSdk().getCard(Number(simpleCardId))) as Card;
  const optimized = optimizeCardDetails(detailedCard);

  console.log(`📋 ${optimized.title}`);
  console.log(`ID: ${optimized.id}`);
  console.log(`Статус: ${optimized.status}`);
  console.log(`📁 ${optimized.state.board} → ${optimized.state.column}`);
  console.log(`👤 Владелец: ${optimized.owner}`);
  if (optimized.size) console.log(`⏱️ Размер: ${optimized.size}`);
  if (optimized.planning.start) {
    console.log(`📅 План: ${optimized.planning.start} - ${optimized.planning.end}`);
  }
  if (optimized.time.spent) console.log(`⏰ Затрачено: ${optimized.time.spent}`);
  if (optimized.tags.length > 0) {
    console.log(`🏷️ Теги: ${optimized.tags.map((t) => t.name).join(', ')}`);
  }
  if (optimized.dependencies.predecessors.length > 0) {
    console.log(`🔗 Зависит от: ${optimized.dependencies.predecessors.map((p: { title: string }) => p.title).join(', ')}`);
  }
  if (optimized.comments > 0) {
    console.log(`💬 Комментариев: ${optimized.comments}`);
  }
  if (optimized.description) {
    console.log(`\n📝 Описание:\n${optimized.description}`);
  }
}

export async function createCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const createData = JSON.parse(args[1] || '{}');
  const createdCard = await getSdk().createCard(createData);
  console.log(JSON.stringify(createdCard, null, 2));
}

export async function updateCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const updateCardId = args[1];
  const updateData = JSON.parse(args[2] || '{}');
  const updatedCard = await getSdk().updateCard(Number(updateCardId), updateData);
  console.log(JSON.stringify(updatedCard, null, 2));
}

export async function deleteCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const deleteCardId = args[1];
  await getSdk().deleteCard(Number(deleteCardId));
  console.log('Card deleted successfully');
}

export async function moveCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const moveCardId = args[1];
  const columnId = args[2];
  const laneId = args[3] || null;
  const movedCard = await getSdk().moveToColumn(Number(moveCardId), Number(columnId), laneId ? Number(laneId) : null);
  console.log(JSON.stringify(movedCard, null, 2));
}

export async function assignCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const assignCardId = args[1];
  const userId = args[2];
  const assignedCard = await getSdk().assignTo(Number(assignCardId), Number(userId));
  console.log(JSON.stringify(assignedCard, null, 2));
}
