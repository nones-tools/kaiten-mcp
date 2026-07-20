import type { Card } from '../../kaiten/interfaces/card.js';
import type { KaitenSDK } from '../../sdk.js';
import { optimizeCardMinimalList } from '../projections.js';

type GetSdk = () => KaitenSDK;

export async function tagCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const sdk = getSdk();
  const tagCmd = args[1];
  if (tagCmd === 'add') {
    const tagCardId = args[2];
    const tagName = args[3];
    const taggedCard = await sdk.addTag(Number(tagCardId), tagName as string);
    console.log(JSON.stringify(taggedCard, null, 2));
  } else if (tagCmd === 'remove') {
    const tagCardId = args[2];
    const tagName = args[3];
    const untaggedCard = await sdk.removeTag(Number(tagCardId), tagName as string);
    console.log(JSON.stringify(untaggedCard, null, 2));
  } else if (tagCmd === 'list') {
    const cards = (await sdk.getCards()) as Card[];
    cards.forEach((card) => {
      const tags = sdk.getTags(card);
      if (tags.length > 0) {
        console.log(`[${card.id}] ${card.title}: ${tags.join(', ')}`);
      }
    });
  } else if (tagCmd === 'filter') {
    const tagName = args[2];
    const filteredCards = await sdk.getCardsWithTag(tagName as string);
    const useMinimal = args.includes('--minimal') || args.includes('-m');
    if (useMinimal) {
      console.log(JSON.stringify(optimizeCardMinimalList(filteredCards), null, 0));
    } else {
      console.log(
        JSON.stringify(
          filteredCards.map((c) => ({
            id: c.id,
            title: c.title,
            tags: sdk.getTags(c),
          })),
          null,
          2
        )
      );
    }
  }
}

export async function findCommand(args: string[], getSdk: GetSdk): Promise<void> {
  const sdk = getSdk();
  const findTag = args[1];
  const boardFilter = args.find((arg) => arg.startsWith('--board='));
  if (findTag) {
    let foundCards: Card[];
    if (boardFilter) {
      const boardValue = boardFilter.split('=')[1] as string;
      let boardId: number;
      if (!isNaN(Number(boardValue))) {
        boardId = parseInt(boardValue, 10);
      } else {
        boardId = await sdk.getBoardId(sdk.config.defaultSpaceId as number, boardValue);
      }
      foundCards = (await sdk.getCards(null, boardId)) as Card[];
      foundCards = foundCards.filter((card) => {
        const cardTags = card.tags?.map((t) => t.name) || [];
        return cardTags.includes(findTag);
      });
    } else {
      foundCards = await sdk.getCardsWithTag(findTag);
    }
    const useMinimalFind = args.includes('--minimal') || args.includes('-m');
    if (useMinimalFind) {
      console.log(JSON.stringify(optimizeCardMinimalList(foundCards), null, 0));
    } else {
      foundCards.forEach((c) => {
        console.log(`[${c.id}] ${c.title}`);
      });
    }
  }
}
