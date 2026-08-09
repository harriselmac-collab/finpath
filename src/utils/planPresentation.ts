export const getAnnualProjectionLabelKey = (value: number) => (
  value < 0 ? 'planDetails.projectionShortfall' : 'planDetails.projectionRemainder'
);
