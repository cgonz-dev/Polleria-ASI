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
  const publicPricePerKg = roundMoney(input.publicPricePerKg);
  const preparationUnitPrice = roundMoney(input.preparationPricePerChicken);
  const isPreferredCustomer = input.customerMode === "PREFERRED_CUSTOMER";
  const weightType = isPreferredCustomer ? "PELADO" : "PLUMA";
  const preparationApplies = !isPreferredCustomer;
  const appliedPricePerKg = roundMoney(
    isPreferredCustomer
      ? input.preferredPricePerKg ?? publicPricePerKg
      : publicPricePerKg
  );
  const chickenSubtotal = roundMoney(totalWeightKg * appliedPricePerKg);
  const preparationTotal = preparationApplies
    ? roundMoney(chickenQuantity * preparationUnitPrice)
    : 0;
  const skinningRequested = Boolean(
    isPreferredCustomer && input.skinningRequested
  );
  const skinningUnitPrice = skinningRequested
    ? roundMoney(input.skinningPricePerChicken ?? 0)
    : 0;
  const skinningTotal = skinningRequested
    ? roundMoney(chickenQuantity * skinningUnitPrice)
    : 0;
  const breastFilletRequested = Boolean(
    isPreferredCustomer && input.breastFilletRequested
  );
  const breastFilletUnitPrice = breastFilletRequested
    ? roundMoney(input.breastFilletPricePerChicken ?? 0)
    : 0;
  const breastFilletTotal = breastFilletRequested
    ? roundMoney(chickenQuantity * breastFilletUnitPrice)
    : 0;
  const extraServicesTotal = roundMoney(skinningTotal + breastFilletTotal);
  const grandTotal = roundMoney(
    chickenSubtotal + preparationTotal + extraServicesTotal
  );

  return {
    appliedPricePerKg,
    breastFilletRequested,
    breastFilletTotal,
    breastFilletUnitPrice,
    chickenSubtotal,
    extraServicesTotal,
    grandTotal,
    preparationApplies,
    preparationTotal,
    skinningRequested,
    skinningTotal,
    skinningUnitPrice,
    weightType,
  };
}
