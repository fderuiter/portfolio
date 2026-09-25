import type { Act, CrisisCard, Pack, Scenario, ShopEntry } from "../types";
import { POPULATION_LABELS, shopEntryId } from "../types";
import { drawInt } from "./rng";
import {
  PACK_SLOTS,
  SHOP_SLOTS,
  cashOut,
  drawDistinct,
  packPool,
  rerollPrice,
  sellValue,
  siteEnrollments,
  stockPool,
  type CashOutReport,
  type PackCard,
} from "./shop";
import {
  CONSUMABLE_SLOTS,
  RELIC_RACK_FULL,
  RELIC_SLOTS,
  advanceTable,
  carriedInventory,
  consumableName,
  consumableSellValue,
  createTableState,
  deriveTableView,
  studyHistory,
  type Consumable,
  type Inventory,
  type StudyHistory,
  type TableAction,
  type TableEvent,
  type TableState,
  type TableView,
} from "./table";

/** One seeded draw, as the run log records it. */
export interface RunDraw {
  /** The draw index this draw consumed. */
  drawIndex: number;
  kind: "BOSS" | "CRISIS";
  /** The boss scenario or crisis card drawn. */
  id: string;
  /** The Blind it was drawn for. */
  blindIndex: number;
}

/** One single-item slot of a shop visit. */
export interface ShopSlot {
  entry: ShopEntry;
  sold: boolean;
}

/** One booster pack slot of a shop visit. */
export interface PackSlot {
  pack: Pack;
  sold: boolean;
}

/** A booster pack being opened: the cards it drew and the ones kept so far. */
export interface OpenedPack {
  pack: Pack;
  cards: PackCard[];
  picked: string[];
}

/** One visit to the Procurement Shop, between a cleared Blind and the next. */
export interface ShopState {
  slots: ShopSlot[];
  packs: PackSlot[];
  /** Rerolls bought this visit; the next one costs `rerollPrice(rerolls)`. */
  rerolls: number;
  /** The pack being opened, until every pick is made or it is skipped. */
  opened: OpenedPack | null;
  /** Items taken this visit, which keeps tray ids unique. */
  purchases: number;
}

/**
 * Serializable run state: the seed and draw log that make the run
 * replayable, which Blind of the act is being played, and that Blind's Card
 * Table. Contains no derived or browser data.
 */
export interface RunState {
  actId: string;
  /** The run seed. The same seed and the same moves replay identically. */
  seed: string;
  /** The next unused draw index. */
  drawIndex: number;
  /** Every seeded draw so far, in order. */
  draws: RunDraw[];
  /** The Boss this run faces: drawn from the act's pool, or its fixed Boss. */
  bossId: string | null;
  /** Index into the run's Blinds, Small first. */
  blindIndex: number;
  table: TableState;
  /** The cleared Blind's cash-out, once the sponsor has paid it. */
  cashOut: CashOutReport | null;
  /** The shop visit after the cash-out, if the act has a shop. */
  shop: ShopState | null;
  /** The next unused draw index on the shop's own seeded stream. */
  shopDraws: number;
}

/** The seed a run uses when none is given. */
export const DEFAULT_SEED = "fold-change";

/**
 * Player intents the run reducer accepts. Every Card Table action except
 * RESET passes through to the current Blind; a lost Blind ends the run, so
 * the only way back is RESTART_RUN.
 */
export type RunAction =
  | Exclude<TableAction, { type: "RESET" }>
  | { type: "NEXT_BLIND" }
  /** Collects the cleared Blind's payout and opens the shop. */
  | { type: "CASH_OUT" }
  /** Redraws the shop's single slots for the escalating reroll price. */
  | { type: "REROLL" }
  /** Buys the item in a single slot. */
  | { type: "BUY"; slot: number }
  /** Buys and opens the booster pack in a pack slot. */
  | { type: "BUY_PACK"; slot: number }
  /** Keeps one card of the pack being opened. */
  | { type: "PICK_PACK_CARD"; cardId: string }
  /** Leaves the pack being opened; its remaining picks are forfeit. */
  | { type: "SKIP_PACK" }
  /** Sells a relic for half its price, rounded down. */
  | { type: "SELL_RELIC"; relicId: string }
  /** A new run: with `seed`, a new seed; without, a replay of this one. */
  | { type: "RESTART_RUN"; seed?: string };

/** Where the run stands. */
export type RunPhase =
  "PLAYING" | "BLIND_CLEARED" | "SHOP" | "RUN_FAILED" | "ACT_COMPLETE";

/** A shop item as the shop screen shows it. */
export interface ShopItemView {
  id: string;
  name: string;
  description: string;
  price: number;
  sold: boolean;
  /** Why it cannot be bought now, or null. */
  refusal: string | null;
}

/** A pack card as the reveal shows it. */
export interface PackCardView {
  id: string;
  kind: "RELIC" | "GUIDANCE" | "SEAL" | "SITE";
  name: string;
  description: string;
  picked: boolean;
  /** Why it cannot be kept now, or null. */
  refusal: string | null;
  /** A site's warning: the populations its enrollment will change. */
  warning: string | null;
}

/** Everything the shop screen renders. */
export interface ShopView {
  items: ShopItemView[];
  packs: ShopItemView[];
  rerollPrice: number;
  rerollRefusal: string | null;
  opened: {
    packId: string;
    name: string;
    choose: number;
    picksLeft: number;
    cards: PackCardView[];
  } | null;
  /** What each relic in the rack sells for, by id. */
  relicSellValues: Record<string, number>;
}

/** Everything a run renders, derived purely from act and state. */
export interface RunView {
  blind: Scenario;
  blindIndex: number;
  blindCount: number;
  isFinalBlind: boolean;
  /** The Blind that follows this one, if any. */
  nextBlind: Scenario | null;
  phase: RunPhase;
  /** The Blind has just started: nothing has been played or discarded. */
  showIntro: boolean;
  table: TableView;
  seed: string;
  draws: RunDraw[];
  /** What the sponsor will pay at cash-out, until it has been paid. */
  pendingCashOut: CashOutReport | null;
  /** The cash-out paid for this Blind, once paid. */
  cashOut: CashOutReport | null;
  /** The shop visit, while the run is in it. */
  shop: ShopView | null;
}

/**
 * The Blinds this run plays, in order. An act with a boss pool contributes
 * its Small and Big Blinds and the Boss the run drew.
 */
export function runBlinds(act: Act, run: Pick<RunState, "bossId">): Scenario[] {
  if (!act.bossPool) return act.blinds;
  const boss = act.bossPool.find((b) => b.id === run.bossId) ?? act.bossPool[0];
  return [...act.blinds, boss];
}

/**
 * Draws the next crisis for a Blind, without replacement across the run.
 * Returns null, consuming no draw, when the act has no crisis left.
 */
function drawCrisis(
  act: Act,
  run: Pick<RunState, "seed" | "drawIndex" | "draws">,
  blindIndex: number
): { crisis: CrisisCard | null; drawIndex: number; draws: RunDraw[] } {
  const drawn = new Set(
    run.draws.filter((d) => d.kind === "CRISIS").map((d) => d.id)
  );
  const remaining = (act.crisisDeck ?? []).filter((c) => !drawn.has(c.id));
  if (remaining.length === 0) {
    return { crisis: null, drawIndex: run.drawIndex, draws: run.draws };
  }
  const crisis = remaining[drawInt(run.seed, run.drawIndex, remaining.length)];
  return {
    crisis,
    drawIndex: run.drawIndex + 1,
    draws: [
      ...run.draws,
      { drawIndex: run.drawIndex, kind: "CRISIS", id: crisis.id, blindIndex },
    ],
  };
}

/** What a relic the shop did not sell (a Boss reward) is valued at. */
const DEFAULT_RELIC_PRICE = 6;

/** The alert shown when a consumable would overfill the tray. */
const TRAY_FULL = `The tray holds ${CONSUMABLE_SLOTS}: sell or use a consumable first.`;

/** A run with a message announced on its table. */
function announce(
  run: RunState,
  kind: TableEvent["kind"],
  message: string,
  patch: Partial<RunState> = {},
  table: TableState = run.table
): RunState {
  return {
    ...run,
    ...patch,
    table: {
      ...table,
      lastEvent: {
        kind,
        message,
        sequence: (run.table.lastEvent?.sequence ?? 0) + 1,
      },
    },
  };
}

/** The SAP rulebook the shop stocks for: the next Blind's. */
function shopRulebook(act: Act, run: RunState) {
  const blinds = runBlinds(act, run);
  return (blinds[run.blindIndex + 1] ?? blinds[run.blindIndex]).rulebook;
}

/** The payout the cleared Blind earns, before it is paid. */
function payoutFor(act: Act, run: RunState): CashOutReport {
  const blind = runBlinds(act, run)[run.blindIndex];
  return cashOut(blind.blind.tier, run.table.cpu.available, run.table.budget);
}

/** Why the cleared Blind cannot be cashed out, or null. */
function cashOutRefusal(act: Act, run: RunState): string | null {
  const blinds = runBlinds(act, run);
  const blind = blinds[run.blindIndex];
  if (run.table.status !== "CLEARED") return `Clear ${blind.blind.name} first.`;
  if (run.blindIndex >= blinds.length - 1) return `${act.title} is complete.`;
  if (blind.encounter && !run.table.rewardClaimed) {
    return "Choose an SOP relic first.";
  }
  if (run.cashOut) return "This Blind is already cashed out.";
  return null;
}

/** Draws the shop's single slots on the shop stream. */
function drawSlots(
  act: Act,
  run: RunState,
  drawIndex: number
): { slots: ShopSlot[]; next: number } {
  const catalog = act.shop;
  if (!catalog) return { slots: [], next: drawIndex };
  const pool = stockPool(
    catalog,
    shopRulebook(act, run),
    run.table.relics.map((r) => r.id)
  );
  const { items, next } = drawDistinct(run.seed, drawIndex, pool, SHOP_SLOTS);
  return { slots: items.map((entry) => ({ entry, sold: false })), next };
}

/** What a relic sells for: half its shop price, rounded down. */
function relicSellValue(act: Act, relicId: string): number {
  const entry = act.shop?.entries.find(
    (e) => e.kind === "RELIC" && e.relic.id === relicId
  );
  return sellValue(entry?.price ?? DEFAULT_RELIC_PRICE);
}

/** Why an entry cannot join the rack or tray now, or null. */
function takeRefusal(table: TableState, entry: ShopEntry): string | null {
  if (entry.kind === "RELIC") {
    return table.relics.length >= RELIC_SLOTS ? RELIC_RACK_FULL : null;
  }
  return table.consumables.length >= CONSUMABLE_SLOTS ? TRAY_FULL : null;
}

/** The table with an entry in its rack or tray. */
function take(table: TableState, entry: ShopEntry, trayId: string): TableState {
  if (entry.kind === "RELIC") {
    return { ...table, relics: [...table.relics, entry.relic] };
  }
  const item: Consumable =
    entry.kind === "SEAL"
      ? { id: trayId, kind: "SEAL", seal: entry.seal }
      : { id: trayId, kind: "GUIDANCE", guidance: entry.guidance };
  return { ...table, consumables: [...table.consumables, item] };
}

/** An entry's printed name and one-line description. */
function describeEntry(entry: ShopEntry): {
  name: string;
  description: string;
} {
  if (entry.kind === "RELIC") {
    return { name: entry.relic.name, description: entry.relic.description };
  }
  if (entry.kind === "GUIDANCE") {
    return {
      name: entry.guidance.name,
      description: `Levels up ${entry.guidance.handType
        .toLowerCase()
        .replace(/_/g, " ")}. ${entry.guidance.flavor}`,
    };
  }
  return { name: entry.seal.name, description: entry.seal.footnote };
}

/** The study time a site goes live: a day after the current snapshot. */
function goLiveAt(table: TableState): string {
  const current = table.snapshots[table.snapshots.length - 1];
  return new Date(Date.parse(current.capturedAt) + 86_400_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

/** Shop actions a run in the shop routes to the shop reducer. */
function shopAction(act: Act, run: RunState, action: RunAction): RunState {
  const shop = run.shop;
  const refuse = (message: string) => announce(run, "REFUSED", message);
  switch (action.type) {
    case "CASH_OUT": {
      const refusal = cashOutRefusal(act, run);
      if (refusal) return refuse(refusal);
      const report = payoutFor(act, run);
      const table = { ...run.table, budget: run.table.budget + report.total };
      let next: RunState = { ...run, table, cashOut: report };
      if (act.shop) {
        const slots = drawSlots(act, next, run.shopDraws);
        const packs = drawDistinct(
          run.seed,
          slots.next,
          act.shop.packs,
          PACK_SLOTS
        );
        next = {
          ...next,
          shopDraws: packs.next,
          shop: {
            slots: slots.slots,
            packs: packs.items.map((pack) => ({ pack, sold: false })),
            rerolls: 0,
            opened: null,
            purchases: 0,
          },
        };
      }
      return announce(
        next,
        "CASHED_OUT",
        `Cash-out: $${report.total}k. Study budget $${table.budget}k.${act.shop ? " The Procurement Shop is open." : ""}`,
        {},
        table
      );
    }
    case "REROLL": {
      if (!shop) return refuse("The shop is closed.");
      if (shop.opened) return refuse("Finish opening the pack first.");
      const price = rerollPrice(shop.rerolls);
      if (run.table.budget < price) {
        return refuse(`Reroll needs $${price}k; $${run.table.budget}k left.`);
      }
      const table = { ...run.table, budget: run.table.budget - price };
      const slots = drawSlots(act, { ...run, table }, run.shopDraws);
      return announce(
        run,
        "SHOP",
        `Rerolled for $${price}k. Next reroll $${rerollPrice(shop.rerolls + 1)}k.`,
        {
          shopDraws: slots.next,
          shop: { ...shop, slots: slots.slots, rerolls: shop.rerolls + 1 },
        },
        table
      );
    }
    case "BUY": {
      if (!shop) return refuse("The shop is closed.");
      if (shop.opened) return refuse("Finish opening the pack first.");
      const slot = shop.slots[action.slot];
      if (!slot || slot.sold) return refuse("That slot is empty.");
      const { name } = describeEntry(slot.entry);
      if (run.table.budget < slot.entry.price) {
        return refuse(
          `${name} costs $${slot.entry.price}k; $${run.table.budget}k left.`
        );
      }
      const full = takeRefusal(run.table, slot.entry);
      if (full) return refuse(full);
      const table = take(
        { ...run.table, budget: run.table.budget - slot.entry.price },
        slot.entry,
        `${shopEntryId(slot.entry)}@shop-${run.blindIndex}-${shop.purchases}`
      );
      return announce(
        run,
        "SHOP",
        `Bought ${name} for $${slot.entry.price}k. Study budget $${table.budget}k.`,
        {
          shop: {
            ...shop,
            purchases: shop.purchases + 1,
            slots: shop.slots.map((s, i) =>
              i === action.slot ? { ...s, sold: true } : s
            ),
          },
        },
        table
      );
    }
    case "BUY_PACK": {
      if (!shop) return refuse("The shop is closed.");
      if (shop.opened) return refuse("Finish opening the pack first.");
      const slot = shop.packs[action.slot];
      if (!slot || slot.sold) return refuse("That pack slot is empty.");
      const { pack } = slot;
      if (run.table.budget < pack.price) {
        return refuse(
          `${pack.name} costs $${pack.price}k; $${run.table.budget}k left.`
        );
      }
      const pool = packPool(
        act.shop!,
        pack,
        shopRulebook(act, run),
        run.table.relics.map((r) => r.id),
        run.table.sites.map((s) => s.id)
      );
      if (pool.length === 0)
        return refuse(`${pack.name} has nothing left to draw.`);
      const { items, next } = drawDistinct(
        run.seed,
        run.shopDraws,
        pool,
        pack.size
      );
      const table = { ...run.table, budget: run.table.budget - pack.price };
      return announce(
        run,
        "SHOP",
        `Opened ${pack.name}: keep ${Math.min(pack.choose, items.length)} of ${items.length}.`,
        {
          shopDraws: next,
          shop: {
            ...shop,
            packs: shop.packs.map((p, i) =>
              i === action.slot ? { ...p, sold: true } : p
            ),
            opened: { pack, cards: items, picked: [] },
          },
        },
        table
      );
    }
    case "PICK_PACK_CARD": {
      const opened = shop?.opened;
      if (!shop || !opened) return refuse("No pack is open.");
      const card = opened.cards.find((c) => c.id === action.cardId);
      if (!card) return refuse("That card is not in the pack.");
      if (opened.picked.includes(card.id))
        return refuse("You already kept it.");
      let table: TableState;
      let name: string;
      if (card.kind === "SITE") {
        name = card.site.name;
        table = {
          ...run.table,
          sites: [...run.table.sites, card.site],
          enrollments: [
            ...run.table.enrollments,
            ...siteEnrollments(card.site, goLiveAt(run.table)),
          ],
        };
      } else {
        const full = takeRefusal(run.table, card.entry);
        if (full) return refuse(full);
        name = describeEntry(card.entry).name;
        table = take(
          run.table,
          card.entry,
          `${card.id}@pack-${run.blindIndex}-${shop.purchases}`
        );
      }
      const picked = [...opened.picked, card.id];
      const done =
        picked.length >= Math.min(opened.pack.choose, opened.cards.length);
      return announce(
        run,
        "SHOP",
        `Kept ${name}.${done ? ` ${opened.pack.name} is done.` : ""}`,
        {
          shop: {
            ...shop,
            purchases: shop.purchases + 1,
            opened: done ? null : { ...opened, picked },
          },
        },
        table
      );
    }
    case "SKIP_PACK": {
      const opened = shop?.opened;
      if (!shop || !opened) return refuse("No pack is open.");
      return announce(run, "SHOP", `Skipped the rest of ${opened.pack.name}.`, {
        shop: { ...shop, opened: null },
      });
    }
    case "SELL_RELIC": {
      if (run.table.status !== "CLEARED") {
        return refuse("Relics are sold between Blinds.");
      }
      const relic = run.table.relics.find((r) => r.id === action.relicId);
      if (!relic) return refuse("That relic is not in your rack.");
      const value = relicSellValue(act, relic.id);
      const table = {
        ...run.table,
        budget: run.table.budget + value,
        relics: run.table.relics.filter((r) => r.id !== relic.id),
      };
      return announce(
        run,
        "SHOP",
        `Sold ${relic.name} for $${value}k. Study budget $${table.budget}k.`,
        {},
        table
      );
    }
    case "SELL_CONSUMABLE": {
      const item = run.table.consumables.find(
        (c) => c.id === action.consumableId
      );
      if (!item) return refuse("That consumable is not in your tray.");
      const value = consumableSellValue(item);
      const table = {
        ...run.table,
        budget: run.table.budget + value,
        consumables: run.table.consumables.filter((c) => c.id !== item.id),
      };
      return announce(
        run,
        "SHOP",
        `Sold ${consumableName(item)} for $${value}k. Study budget $${table.budget}k.`,
        {},
        table
      );
    }
    default:
      return run;
  }
}

/** The shop as the shop screen renders it. */
function deriveShopView(act: Act, run: RunState): ShopView | null {
  const shop = run.shop;
  if (!shop) return null;
  const budget = run.table.budget;
  const busy = shop.opened ? "Finish opening the pack first." : null;
  const afford = (name: string, price: number) =>
    budget < price ? `${name} costs $${price}k; $${budget}k left.` : null;
  const price = rerollPrice(shop.rerolls);
  const opened = shop.opened;
  return {
    items: shop.slots.map((slot, i) => {
      const { name, description } = describeEntry(slot.entry);
      return {
        id: `slot-${i}`,
        name,
        description,
        price: slot.entry.price,
        sold: slot.sold,
        refusal: slot.sold
          ? "Sold."
          : (busy ??
            afford(name, slot.entry.price) ??
            takeRefusal(run.table, slot.entry)),
      };
    }),
    packs: shop.packs.map((slot, i) => ({
      id: `pack-${i}`,
      name: slot.pack.name,
      description: `${slot.pack.description} Choose ${slot.pack.choose} of ${slot.pack.size}.`,
      price: slot.pack.price,
      sold: slot.sold,
      refusal: slot.sold
        ? "Opened."
        : (busy ?? afford(slot.pack.name, slot.pack.price)),
    })),
    rerollPrice: price,
    rerollRefusal:
      busy ??
      (budget < price ? `Reroll needs $${price}k; $${budget}k left.` : null),
    opened: opened
      ? {
          packId: opened.pack.id,
          name: opened.pack.name,
          choose: opened.pack.choose,
          picksLeft:
            Math.min(opened.pack.choose, opened.cards.length) -
            opened.picked.length,
          cards: opened.cards.map((card): PackCardView => {
            const picked = opened.picked.includes(card.id);
            if (card.kind === "SITE") {
              const populations = [
                ...new Set(card.site.subjects.flatMap((s) => s.populations)),
              ].map((p) => POPULATION_LABELS[p]);
              return {
                id: card.id,
                kind: "SITE",
                name: card.site.name,
                description: card.site.description,
                picked,
                refusal: picked ? "Kept." : null,
                warning: `Enrolls ${card.site.subjects.length} ${card.site.subjects.length === 1 ? "subject" : "subjects"} into ${populations.join(", ")} after the next Blind's first hand: outputs in hand on those populations then go stale.`,
              };
            }
            const { name, description } = describeEntry(card.entry);
            return {
              id: card.id,
              kind: card.entry.kind,
              name,
              description,
              picked,
              refusal: picked ? "Kept." : takeRefusal(run.table, card.entry),
              warning: null,
            };
          }),
        }
      : null,
    relicSellValues: Object.fromEntries(
      run.table.relics.map((r) => [r.id, relicSellValue(act, r.id)])
    ),
  };
}

/** A fresh table for a Blind, announcing it with a sequence that follows `after`. */
function startBlind(
  scenario: Scenario,
  history: StudyHistory | undefined,
  inventory: Inventory | undefined,
  crisis: CrisisCard | null,
  after: TableEvent | null,
  kind: TableEvent["kind"],
  message: string
): TableState {
  const table = createTableState(scenario, history, inventory, crisis);
  const drawn = crisis ? ` Crisis: ${crisis.name}. ${crisis.description}` : "";
  return {
    ...table,
    lastEvent: {
      kind,
      message: `${message}${drawn}`,
      sequence: (after?.sequence ?? 0) + 1,
    },
  };
}

/**
 * A fresh run for `seed`: the Boss drawn from the act's pool (a pool of one
 * is fixed and consumes no draw), and the first Blind dealt with full CPU.
 * The first Blind draws no crisis.
 */
export function createRunState(
  act: Act,
  seed: string = DEFAULT_SEED
): RunState {
  let drawIndex = 0;
  const draws: RunDraw[] = [];
  let bossId: string | null =
    act.blinds.find((b) => b.blind.tier === "BOSS_BLIND")?.id ?? null;
  if (act.bossPool) {
    const pool = act.bossPool;
    if (pool.length === 1) {
      bossId = pool[0].id;
    } else {
      bossId = pool[drawInt(seed, drawIndex, pool.length)].id;
      draws.push({
        drawIndex,
        kind: "BOSS",
        id: bossId,
        blindIndex: act.blinds.length,
      });
      drawIndex += 1;
    }
  }
  return {
    actId: act.id,
    seed,
    drawIndex,
    draws,
    bossId,
    blindIndex: 0,
    table: createTableState(act.blinds[0]),
    cashOut: null,
    shop: null,
    shopDraws: 0,
  };
}

/**
 * Pure run reducer. It composes the Card Table reducer for the current Blind
 * and moves between Blinds, drawing each later Blind's crisis from the
 * seeded event draw. The draw piles are fixed and every draw is a function
 * of the seed and draw index, so the same act, seed and action sequence
 * always yields the same state.
 */
export function advanceRun(
  act: Act,
  run: RunState,
  action: RunAction
): RunState {
  const blinds = runBlinds(act, run);
  const blind = blinds[run.blindIndex];
  const refuse = (message: string): RunState => ({
    ...run,
    table: {
      ...run.table,
      lastEvent: {
        kind: "REFUSED",
        message,
        sequence: (run.table.lastEvent?.sequence ?? 0) + 1,
      },
    },
  });

  switch (action.type) {
    case "RESTART_RUN": {
      // A new run is a new study: its population history starts over, and
      // the tray and budget are empty again. The same seed replays the same
      // Boss and crises.
      const fresh = createRunState(act, action.seed ?? run.seed);
      const first = act.blinds[0];
      return {
        ...fresh,
        table: startBlind(
          first,
          undefined,
          undefined,
          null,
          run.table.lastEvent,
          "RESET",
          `Run restarted. ${first.blind.name}.`
        ),
      };
    }
    case "CASH_OUT":
    case "REROLL":
    case "BUY":
    case "BUY_PACK":
    case "PICK_PACK_CARD":
    case "SKIP_PACK":
    case "SELL_RELIC":
      return shopAction(act, run, action);
    case "NEXT_BLIND": {
      if (run.table.status !== "CLEARED") {
        return refuse(`Clear ${blind.blind.name} first.`);
      }
      if (blind.encounter && !run.table.rewardClaimed) {
        return refuse("Choose an SOP relic first.");
      }
      const index = run.blindIndex + 1;
      if (index >= blinds.length) {
        return refuse(`${act.title} is complete.`);
      }
      if (run.shop?.opened) {
        return refuse("Keep a card from the pack or skip it first.");
      }
      // Leaving without visiting the shop still collects the payout.
      const paid = run.cashOut
        ? run.table
        : {
            ...run.table,
            budget: run.table.budget + payoutFor(act, run).total,
          };
      const next = blinds[index];
      const { crisis, drawIndex, draws } = drawCrisis(act, run, index);
      return {
        ...run,
        drawIndex,
        draws,
        blindIndex: index,
        // The study goes on: later Blinds see every snapshot change so far,
        // and the tray and budget come along.
        cashOut: null,
        shop: null,
        table: startBlind(
          next,
          studyHistory(paid),
          carriedInventory(paid),
          crisis,
          run.table.lastEvent,
          "BLIND_STARTED",
          `${next.blind.name}. Target ${next.blind.quota}.`
        ),
      };
    }
    case "SELL_CONSUMABLE":
      // Between Blinds the table is closed; the shop takes the sale.
      if (run.table.status === "CLEARED") return shopAction(act, run, action);
      return { ...run, table: advanceTable(blind, run.table, action) };
    default:
      return { ...run, table: advanceTable(blind, run.table, action) };
  }
}

/** Derives everything a run renders. Pure; safe to call on every render. */
export function deriveRunView(act: Act, run: RunState): RunView {
  const { blindIndex } = run;
  const blinds = runBlinds(act, run);
  const blind = blinds[blindIndex];
  const isFinalBlind = blindIndex === blinds.length - 1;
  const phase: RunPhase =
    run.table.status === "CLEARED"
      ? isFinalBlind
        ? "ACT_COMPLETE"
        : run.shop
          ? "SHOP"
          : "BLIND_CLEARED"
      : run.table.status === "FAILED"
        ? "RUN_FAILED"
        : "PLAYING";
  return {
    blind,
    blindIndex,
    blindCount: blinds.length,
    isFinalBlind,
    nextBlind: isFinalBlind ? null : blinds[blindIndex + 1],
    phase,
    showIntro:
      phase === "PLAYING" &&
      run.table.handsPlayed === 0 &&
      run.table.discards === 0,
    table: deriveTableView(blind, run.table),
    seed: run.seed,
    draws: run.draws,
    pendingCashOut:
      cashOutRefusal(act, run) === null ? payoutFor(act, run) : null,
    cashOut: run.cashOut,
    shop: deriveShopView(act, run),
  };
}
