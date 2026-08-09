import { supabase } from './supabaseClient';

export const PROFILE_IMAGE_BUCKET = 'private-user-files';
export const isInlineProfileImage = (value: string) => value.startsWith('data:image/');

export const uploadProfileImage = async (userId: string, dataUri: string) => {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUri);
  if (!match) throw new Error('Invalid profile image');

  const bytes = Uint8Array.from(globalThis.atob(match[2]), (character) => character.charCodeAt(0));
  const path = `${userId}/profile/avatar.jpg`;
  const { error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).upload(path, bytes, {
    contentType: match[1],
    upsert: true,
  });
  if (error) throw error;
  return path;
};

export const removeProfileImage = async (path: string) => {
  const { error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
};

export const createProfileImageUrl = async (path: string) => {
  if (!path || isInlineProfileImage(path) || /^https?:\/\//.test(path)) return path;
  const { data, error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
};
