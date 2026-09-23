import type { RoundingMode } from "../types";

const MAX_PRECISION = 12;
// BigInt literals need an ES2020 target; this project compiles to ES2017.
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const TEN = BigInt(10);

/**
 * Rounds `numerator / denominator` to `precision` decimal places using exact
 * integer arithmetic, so ties such as 45.25 are detected exactly rather than
 * through binary floating point. Returns the fixed-point string, or `null`
 * when the ratio is not computable (zero or non-integer operands, or an
 * out-of-range precision).
 */
export function roundRatio(
  numerator: number,
  denominator: number,
  precision: number,
  mode: RoundingMode
): string | null {
  if (
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    denominator === 0 ||
    !Number.isInteger(precision) ||
    precision < 0 ||
    precision > MAX_PRECISION
  ) {
    return null;
  }

  const negative = numerator < 0 !== denominator < 0 && numerator !== 0;
  const a = BigInt(Math.abs(numerator));
  const b = BigInt(Math.abs(denominator));
  const scale = TEN ** BigInt(precision);
  const scaled = a * scale;
  let quotient = scaled / b;
  const twiceRemainder = (scaled % b) * TWO;

  if (mode === "HALF_AWAY_FROM_ZERO" && twiceRemainder >= b) {
    quotient += ONE;
  } else if (mode === "HALF_EVEN") {
    if (
      twiceRemainder > b ||
      (twiceRemainder === b && quotient % TWO === ONE)
    ) {
      quotient += ONE;
    }
  }

  const whole = (quotient / scale).toString();
  const fraction = (quotient % scale).toString().padStart(precision, "0");
  const magnitude = precision === 0 ? whole : `${whole}.${fraction}`;
  return negative && quotient !== ZERO ? `-${magnitude}` : magnitude;
}

/** Number of digits after the decimal point in a displayed number. */
export function decimalPlaces(displayed: string): number {
  const point = displayed.indexOf(".");
  return point === -1 ? 0 : displayed.length - point - 1;
}
