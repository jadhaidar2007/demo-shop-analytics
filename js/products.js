// The whole "catalogue". Three products, hard-coded on purpose.
// item_id / item_name / price here are exactly what ends up in the dataLayer.

const CURRENCY = 'EUR';

const PRODUCTS = {
  'SP-001': {
    id: 'SP-001',
    name: 'Ceramic Pour-Over Dripper',
    category: 'Brewing',
    price: 24.0,
    url: 'product-dripper.html',
    img: 'img/dripper.svg',
    blurb: 'A plain cone dripper in glazed stoneware. Sits on most mugs, holds heat well and rinses clean.',
    specs: ['Makes 1–2 cups', 'Glazed stoneware', 'Takes #2 paper filters']
  },
  'SP-002': {
    id: 'SP-002',
    name: 'Hand Coffee Grinder',
    category: 'Grinding',
    price: 59.0,
    url: 'product-grinder.html',
    img: 'img/grinder.svg',
    blurb: 'Steel conical burrs and a fold-away crank. Small enough for a backpack, quiet enough for 7am.',
    specs: ['Stainless conical burrs', 'Holds roughly 25 g of beans', 'Espresso to French press settings']
  },
  'SP-003': {
    id: 'SP-003',
    name: 'Gooseneck Kettle',
    category: 'Kettles',
    price: 42.5,
    url: 'product-kettle.html',
    img: 'img/kettle.svg',
    blurb: 'A slim spout makes the pour slow and steady, which is most of what pour-over is about.',
    specs: ['0.8 L capacity', 'Stainless steel body', 'Heat-proof handle']
  }
};
