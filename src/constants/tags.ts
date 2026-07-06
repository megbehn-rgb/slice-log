export const PIZZA_STYLE_TAGS = [
  'Neapolitan',
  'NY Slice',
  'Sicilian/Square',
  'Tavern-Style',
  'Bar Pie',
  'Deep Dish',
  'Wood-Fired',
  'Coal-Fired',
] as const;

export type PizzaStyleTag = (typeof PIZZA_STYLE_TAGS)[number];

export const ORDER_TYPES = ['Margarita', 'Plain', 'Pepperoni', 'Specialty/Other'] as const;

export type OrderType = (typeof ORDER_TYPES)[number];
