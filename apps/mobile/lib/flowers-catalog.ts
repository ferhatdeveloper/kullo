/** Çiçek / florist mock — Ana SuperHomeFeed + /food/flowers aynı seed. */

export type FlowerProduct = {
  id: string;
  nameKey: string;
  price_iqd: number;
  uri: string;
  descKey: string;
};

export type FloristStore = {
  id: string;
  nameKey: string;
  eta_min: number;
  rating: number;
  uri: string;
};

export const FLOWERS_STORE_ID = "kullo-flowers";

export const FLOWERS: FlowerProduct[] = [
  {
    id: "fl1",
    nameKey: "food.flowerRose",
    price_iqd: 35_000,
    uri: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80",
    descKey: "food.flowerRoseDesc",
  },
  {
    id: "fl2",
    nameKey: "food.flowerTulip",
    price_iqd: 28_000,
    uri: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80",
    descKey: "food.flowerTulipDesc",
  },
  {
    id: "fl3",
    nameKey: "food.flowerLily",
    price_iqd: 32_000,
    uri: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=600&q=80",
    descKey: "food.flowerLilyDesc",
  },
  {
    id: "fl4",
    nameKey: "food.flowerOrchid",
    price_iqd: 45_000,
    uri: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=600&q=80",
    descKey: "food.flowerOrchidDesc",
  },
  {
    id: "fl5",
    nameKey: "food.flowerMixed",
    price_iqd: 40_000,
    uri: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
    descKey: "food.flowerMixedDesc",
  },
  {
    id: "fl6",
    nameKey: "food.flowerSunflower",
    price_iqd: 25_000,
    uri: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80",
    descKey: "food.flowerSunflowerDesc",
  },
];

export const FLOWER_GIFTS: FlowerProduct[] = [
  {
    id: "gf1",
    nameKey: "food.giftBox",
    price_iqd: 55_000,
    uri: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80",
    descKey: "food.giftBoxDesc",
  },
  {
    id: "gf2",
    nameKey: "food.giftChocolate",
    price_iqd: 22_000,
    uri: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    descKey: "food.giftChocolateDesc",
  },
  {
    id: "gf3",
    nameKey: "food.giftBalloon",
    price_iqd: 18_000,
    uri: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
    descKey: "food.giftBalloonDesc",
  },
  {
    id: "gf4",
    nameKey: "food.giftCandle",
    price_iqd: 15_000,
    uri: "https://images.unsplash.com/photo-1572726729207-a78d6feb5b67?auto=format&fit=crop&w=600&q=80",
    descKey: "food.giftCandleDesc",
  },
];

export const FLORISTS: FloristStore[] = [
  {
    id: "fs1",
    nameKey: "food.floristBloom",
    eta_min: 35,
    rating: 4.8,
    uri: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "fs2",
    nameKey: "food.floristGarden",
    eta_min: 40,
    rating: 4.6,
    uri: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "fs3",
    nameKey: "food.floristPetal",
    eta_min: 30,
    rating: 4.9,
    uri: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
  },
];
