import { useEffect, useState } from 'react';
import { createProfileImageUrl } from '../services/supabase/profileImages';

export const useProfileImageUri = (storedValue: string) => {
  const [uri, setUri] = useState(storedValue);

  useEffect(() => {
    let active = true;
    void createProfileImageUrl(storedValue)
      .then((resolved) => { if (active) setUri(resolved); })
      .catch(() => { if (active) setUri(''); });
    return () => { active = false; };
  }, [storedValue]);

  return uri;
};
