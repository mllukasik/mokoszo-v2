// Stałe definicje SlotTag — sloty posiłków dnia
export type SlotTag = 'sniadanie' | 'drugie-sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja';

export interface SlotDefinition {
  id: SlotTag;
  label: string;
  emoji: string;
  defaultOrder: number;
}

export const SLOTS: SlotDefinition[] = [
  { id: 'sniadanie',         label: 'Śniadanie',         emoji: '🌅', defaultOrder: 1 },
  { id: 'drugie-sniadanie',  label: 'Drugie śniadanie',  emoji: '🍎', defaultOrder: 2 },
  { id: 'obiad',             label: 'Obiad',              emoji: '🍽️', defaultOrder: 3 },
  { id: 'podwieczorek',      label: 'Podwieczorek',       emoji: '🫖', defaultOrder: 4 },
  { id: 'kolacja',           label: 'Kolacja',            emoji: '🌙', defaultOrder: 5 },
];

export const SLOT_MAP = Object.fromEntries(
  SLOTS.map((s) => [s.id, s])
) as Record<SlotTag, SlotDefinition>;
