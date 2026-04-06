// Built-in canonical food list for autocomplete and interaction lookups

export const CANONICAL_FOODS = [
  'Grapefruit',
  'Grapefruit Juice',
  'Orange Juice',
  'Cranberry Juice',
  'Pomegranate Juice',
  'Milk',
  'Yogurt',
  'Cheese',
  'Green Leafy Vegetables',
  'Spinach',
  'Kale',
  'Broccoli',
  'Brussels Sprouts',
  'Cabbage',
  'Bananas',
  'Avocados',
  'Tomatoes',
  'Potatoes',
  'Sweet Potatoes',
  'Licorice',
  'Ginger',
  'Garlic',
  'Turmeric',
  'St. John\'s Wort',
  'Ginseng',
  'Green Tea',
  'Black Tea',
  'Coffee',
  'Alcohol',
  'Red Wine',
  'Beer',
  'Soy Products',
  'Tofu',
  'Soy Milk',
  'Tyramine-rich Foods',
  'Aged Cheese',
  'Smoked Meats',
  'Pickled Foods',
  'Fermented Foods',
  'Chocolate',
  'Caffeine',
  'Salt Substitutes',
  'High-Sodium Foods',
  'High-Potassium Foods',
  'High-Calcium Foods',
  'High-Fiber Foods',
  'Fatty Foods',
  'Fried Foods',
];

/**
 * Get all canonical food names
 */
export function getAllFoods(): string[] {
  return [...CANONICAL_FOODS];
}
