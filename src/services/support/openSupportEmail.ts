import { Linking } from 'react-native';

export const buildSupportEmailUrl = (email: string, subject: string, message: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

export const openSupportEmail = async (subject: string, message: string) => {
  const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();
  if (!email) throw new Error('Support email is not configured.');
  const url = buildSupportEmailUrl(email, subject, message);
  if (!(await Linking.canOpenURL(url))) throw new Error('No email application is available on this device.');
  await Linking.openURL(url);
};
