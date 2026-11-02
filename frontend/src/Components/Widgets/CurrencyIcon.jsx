import { useCurrency } from "../../hooks/useCurrency";

const CurrencyIcon = ({ size = 18 }) => {
  const { symbol } = useCurrency();
  return (
    <span
      className="font-bold leading-none select-none"
      style={{ fontSize: size * 0.8 }}
    >
      {symbol}
    </span>
  );
};

export default CurrencyIcon;