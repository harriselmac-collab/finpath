export const parseAuthCallback = (url: string) => {
  const sections = [url.split('?')[1]?.split('#')[0], url.split('#')[1]].filter(Boolean) as string[];
  const values = Object.fromEntries(sections.flatMap((section) => section.split('&').map((entry) => {
    const [key, ...rest] = entry.split('=');
    return [decodeURIComponent(key), decodeURIComponent(rest.join('=') || '')];
  })));

  return {
    accessToken: values.access_token,
    refreshToken: values.refresh_token,
    type: values.type,
    errorCode: values.error_code || values.error,
  };
};

export const parseRecoveryTokens = parseAuthCallback;
