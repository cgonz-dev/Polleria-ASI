import type {
  PlumaSaleCalculationInput,
  PlumaSaleCalculationResult,
} from "@/lib/modules/ventas-pluma/types";

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundKg(value: number) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function calculatePlumaSale(
  input: PlumaSaleCalculationInput
): PlumaSaleCalculationResult {
  const chickenQuantity = Math.trunc(input.chickenQuantity);
  const totalWeightKg = roundKg(input.totalWeightKg);
  const basePricePerKg = roundMoney(input.basePricePerKg);
  const discountPerKg = roundMoney(input.discountPerKg);
  const preparationUnitPrice = roundMoney(input.preparationUnitPrice);
  const appliedPricePerKg = roundMoney(basePricePerKg - discountPerKg);
  const chickenSubtotal = roundMoney(totalWeightKg * appliedPricePerKg);
  const preparationTotal = roundMoney(chickenQuantity * preparationUnitPrice);
  const grandTotal = roundMoney(chickenSubtotal + preparationTotal);

  return {
    appliedPricePerKg,
    chickenSubtotal,
    preparationTotal,
    grandTotal,
  };
}
