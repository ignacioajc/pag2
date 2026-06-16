export const heroSlides = [
  'images/download.jpg',
  'images/GettyImages-2201476691.jpg.webp',
  'images/WCGACO4PPFGKHF3HIC4CXVKF5U.JPG',
  'images/basket.JPG',
  'images/NK+EVERYDAY+PLAYGROUND+8P+DEFL.JPG',
  'images/Estilos-y-tipos-de-artes-marciales-1-1080x675.jpg'
];

export const categories = [
  {
    title: 'Artes Marciales',
    description: 'Guantillas, kimonos, protecciones y más.',
    products: [
      { id: 'kimono-pro-x', title: 'Kimono Pro X', price: 59.99, img: 'images/kids-gi.svg' },
      { id: 'raptor-gloves', title: 'Guantes Raptor', price: 79.99, img: 'images/boxing-gloves.svg' }
    ]
  },
  {
    title: 'Basketball',
    description: 'Balones, zapatillas y equipamiento de alto rendimiento.',
    products: [
      { id: 'air-zone-1', title: 'Air Zone 1', price: 129.99, img: 'images/bball-shoe.svg' },
      { id: 'balon-elite', title: 'Balón Elite', price: 34.99, img: 'images/basketball.svg' }
    ]
  },
  {
    title: 'Fútbol',
    description: 'Botas, balones y accesorios para todos los niveles.',
    products: [
      { id: 'speedkick-fg', title: 'SpeedKick FG', price: 149.99, img: 'images/football-boot.svg' },
      { id: 'balon-match', title: 'Balón Match', price: 44.99, img: 'images/football.svg' }
    ]
  }
];

export const products = [
  { id: 'air-zone-1', title: 'Air Zone 1', img: 'images/bball-shoe.jpg', base: 130 },
  { id: 'raptor-gloves', title: 'Guantes Raptor', img: 'images/boxing-gloves.jpg', base: 180 },
  { id: 'speedkick-fg', title: 'SpeedKick FG', img: 'images/football-boot.jpg', base: 220 },
  { id: 'kimono-pro-x', title: 'Kimono Pro X', img: 'images/kids-gi.jpg', base: 60 },
  { id: 'balon-elite', title: 'Balón Elite', img: 'images/basketball.jpg', base: 35 },
  { id: 'balon-match', title: 'Balón Match', img: 'images/football.jpg', base: 45 }
];

export const auctionProducts = [
  { id: 'air-zone-1', title: 'Air Zone 1 (Limited)', img: 'images/bball-shoe.svg', currentBid: 129.99, ends: Date.now() + 1000 * 60 * 60 * 6 },
  { id: 'raptor-gloves', title: 'Guantes Raptor (Signed)', img: 'images/boxing-gloves.svg', currentBid: 199.0, ends: Date.now() + 1000 * 60 * 60 * 24 },
  { id: 'speedkick-fg', title: 'SpeedKick FG (Rare)', img: 'images/football-boot.svg', currentBid: 249.5, ends: Date.now() + 1000 * 60 * 60 * 45 }
];

export const randomUsers = [
  { id: 1, name: 'Juan M.', avatar: '👨‍💼' },
  { id: 2, name: 'María L.', avatar: '👩‍💼' },
  { id: 3, name: 'Carlos R.', avatar: '👨‍💻' },
  { id: 4, name: 'Ana P.', avatar: '👩‍💻' },
  { id: 5, name: 'Diego H.', avatar: '👨‍🎨' }
];

export function findProductById(id) {
  return products.find((product) => product.id === id) || null;
}

export function buildPriceHistory(base) {
  const days = 365;
  const values = [];
  let price = base;
  const startDate = Date.now() - (days - 1) * 24 * 60 * 60 * 1000;
  for (let i = 0; i < days; i += 1) {
    const randomDelta = (Math.random() - 0.5) * 0.03;
    price = Math.max(5, price * (1 + randomDelta));
    values.push(Math.round(price * 100) / 100);
  }
  const labels = values.map((_, index) => {
    const date = new Date(startDate + index * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  });
  return { labels, values };
}
