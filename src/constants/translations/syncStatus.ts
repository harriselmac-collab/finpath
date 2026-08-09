import type { SupportedLanguageCode } from '../../services/localization/languages';

type SyncStatusTranslation = {
  localOnly: string;
  syncing: string;
  synced: string;
  offline: string;
  failed: string;
  conflict: string;
  lastSynced: string;
  localNotice: string;
};

export const syncStatusTranslations = {
  en: { localOnly: 'Saved on this device', syncing: 'Syncing…', synced: 'Synced', offline: 'Offline', failed: 'Sync failed', conflict: 'Sync conflict', lastSynced: 'Last synced {{time}}', localNotice: 'Cloud sync has not completed yet.' },
  fr: { localOnly: 'Enregistré sur cet appareil', syncing: 'Synchronisation…', synced: 'Synchronisé', offline: 'Hors ligne', failed: 'Échec de la synchronisation', conflict: 'Conflit de synchronisation', lastSynced: 'Dernière synchronisation à {{time}}', localNotice: 'La synchronisation cloud n’est pas encore terminée.' },
  ar: { localOnly: 'محفوظ على هذا الجهاز', syncing: 'جارٍ المزامنة…', synced: 'تمت المزامنة', offline: 'غير متصل', failed: 'فشلت المزامنة', conflict: 'تعارض في المزامنة', lastSynced: 'آخر مزامنة {{time}}', localNotice: 'لم تكتمل المزامنة السحابية بعد.' },
  es: { localOnly: 'Guardado en este dispositivo', syncing: 'Sincronizando…', synced: 'Sincronizado', offline: 'Sin conexión', failed: 'Error de sincronización', conflict: 'Conflicto de sincronización', lastSynced: 'Última sincronización a las {{time}}', localNotice: 'La sincronización en la nube aún no se ha completado.' },
  de: { localOnly: 'Auf diesem Gerät gespeichert', syncing: 'Synchronisierung…', synced: 'Synchronisiert', offline: 'Offline', failed: 'Synchronisierung fehlgeschlagen', conflict: 'Synchronisierungskonflikt', lastSynced: 'Zuletzt synchronisiert um {{time}}', localNotice: 'Die Cloud-Synchronisierung ist noch nicht abgeschlossen.' },
  pt: { localOnly: 'Guardado neste dispositivo', syncing: 'A sincronizar…', synced: 'Sincronizado', offline: 'Sem ligação', failed: 'Falha na sincronização', conflict: 'Conflito de sincronização', lastSynced: 'Última sincronização às {{time}}', localNotice: 'A sincronização na nuvem ainda não foi concluída.' },
  it: { localOnly: 'Salvato su questo dispositivo', syncing: 'Sincronizzazione…', synced: 'Sincronizzato', offline: 'Offline', failed: 'Sincronizzazione non riuscita', conflict: 'Conflitto di sincronizzazione', lastSynced: 'Ultima sincronizzazione alle {{time}}', localNotice: 'La sincronizzazione cloud non è ancora terminata.' },
  nl: { localOnly: 'Op dit apparaat opgeslagen', syncing: 'Synchroniseren…', synced: 'Gesynchroniseerd', offline: 'Offline', failed: 'Synchronisatie mislukt', conflict: 'Synchronisatieconflict', lastSynced: 'Laatst gesynchroniseerd om {{time}}', localNotice: 'Cloudsynchronisatie is nog niet voltooid.' },
  tr: { localOnly: 'Bu cihazda kaydedildi', syncing: 'Eşitleniyor…', synced: 'Eşitlendi', offline: 'Çevrimdışı', failed: 'Eşitleme başarısız', conflict: 'Eşitleme çakışması', lastSynced: 'Son eşitleme {{time}}', localNotice: 'Bulut eşitlemesi henüz tamamlanmadı.' },
} satisfies Record<SupportedLanguageCode, SyncStatusTranslation>;
