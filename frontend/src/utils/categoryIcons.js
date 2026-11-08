import {
  FiDollarSign, FiShoppingCart, FiFilm, FiTruck, FiHeart, FiBook, FiTag,
  FiCoffee, FiHome, FiGift, FiSmartphone, FiZap, FiBriefcase, FiScissors,
  FiMusic, FiSmile,
} from "react-icons/fi";

// Key harus sama dengan ICONS di backend (utils/categories.js).
export const CATEGORY_ICONS = {
  wallet: FiDollarSign,
  cart: FiShoppingCart,
  film: FiFilm,
  truck: FiTruck,
  heart: FiHeart,
  book: FiBook,
  tag: FiTag,
  coffee: FiCoffee,
  home: FiHome,
  gift: FiGift,
  phone: FiSmartphone,
  zap: FiZap,
  briefcase: FiBriefcase,
  scissors: FiScissors,
  music: FiMusic,
  smile: FiSmile,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export const getCategoryIcon = (key) => CATEGORY_ICONS[key] || FiTag;