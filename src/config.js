// Change these values to tune the game without rewriting its logic.
export const WIDTH = 1000;
export const HEIGHT = 560;
export const GROUND = 448;
export const PLAYER_X = 170;
export const GRAVITY = 1900;
export const JUMP = -690;
export const START_SPEED = 300;
export const MAX_SPEED = 650;
export const SKINS = [
  { name: 'Classic', color: 0xd9f28b, price: 0 },
  { name: 'Jungle', color: 0x71dbad, price: 20 },
  { name: 'Electric', color: 0x8fc9ff, price: 20 },
  { name: 'Armoured', color: 0xc8badf, price: 20 },
  // Retired ID stays reserved so old purchases never shift to another skin.
  { name: 'Phoenix', color: 0xffad76, price: 300, retired: true },
  { name: 'Bubble Gum Dino', color: 0xffffff, price: 20, art: 'bubblegum' },
  { name: 'Charmender', color: 0xffffff, price: 150, art: 'charmender' },
  { name: 'Cyber Dino', color: 0xffffff, price: 250, art: 'cyber' },
  { name: 'Gandhiji Dino', color: 0xffffff, price: 250, art: 'gandhiji' },
  { name: 'Modi Ji Dino', color: 0xffffff, price: 250, art: 'modiji' },
  { name: 'Trump Dino', color: 0xffffff, price: 250, art: 'trump' },
  { name: 'Habibi Dino', color: 0xffffff, price: 350, art: 'habibi' },
  { name: 'Camel', color: 0xffffff, price: 200, art: 'camel' },
  { name: 'Golden Dino', color: 0xffffff, price: 500, art: 'golden' },
];
// Display order is independent of permanent save IDs. Camel sits by Cyber Dino.
export const SKIN_STORE_ORDER = [0,1,2,3,5,6,7,12,8,9,10,11,13];
