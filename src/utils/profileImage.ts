export const MAX_PROFILE_IMAGE_DATA_URI_LENGTH = 750_000;

export const getCenteredSquareCrop = (width: number, height: number) => {
  if (width <= 0 || height <= 0) return null;
  const side = Math.min(width, height);
  return {
    originX: Math.max(0, (width - side) / 2),
    originY: Math.max(0, (height - side) / 2),
    width: side,
    height: side,
  };
};

export const createStoredProfileImage = (base64: string) => {
  if (!base64) return null;
  const dataUri = `data:image/jpeg;base64,${base64}`;
  return dataUri.length <= MAX_PROFILE_IMAGE_DATA_URI_LENGTH ? dataUri : null;
};
