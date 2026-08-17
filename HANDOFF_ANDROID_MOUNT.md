# Pocket Ahead Android Mount Handoff

Updated: 2026-08-13 (Africa/Casablanca)

## Objective

Mount the current Pocket Ahead build in Android Studio, install it on an emulator, and verify the rendered app—not only the build output.

## Confirmed failure

The emulator displayed a React Native red error screen:

```text
Cannot find native module 'ExpoCrypto'
```

The failure originates when `src/services/storage/encryptedStorage.ts` imports the native `expo-crypto` module.

This is not evidence that the current TypeScript refactor broke the app. The emulator was running a stale APK from 2026-08-11 that does not contain the newly required native module.

## Confirmed root cause blocking the update

The active emulator uses an Android 17 / API 37.1 preview image. Its Android Package Installer is broken because the system image does not publish the required `persistent_data_block` service.

Evidence from `adb logcat` during APK installation:

```text
No service published for: persistent_data_block
ServiceNotFoundException: No service published for: persistent_data_block
at com.android.server.pm.PackageInstallerSession.markAsSealed(...)
```

As a result, every replacement APK install stalls or fails while Package Installer seals the session. Rebooting the emulator did not restore the missing service.

Do not change app code to work around this emulator defect.

## Current build status

The current native debug build completed successfully with Expo modules included.

APK:

```text
C:\Users\Harris\Documents\Ultimate AI\Pocket Ahead\finpath\android\app\build\outputs\apk\debug\app-debug.apk
```

The APK is an x86_64 debug build, approximately 88 MB, produced with:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME='C:\Users\Harris\AppData\Local\Android\Sdk'
$env:NODE_ENV='development'
& 'C:\Users\Harris\.gradle\wrapper\dists\gradle-9.3.1-bin\23ovyewtku6u96viwx3xl3oks\gradle-9.3.1\bin\gradle.bat' app:assembleDebug -PreactNativeArchitectures=x86_64 --no-daemon --console=plain --offline
```

The current Android package is:

```text
com.kaellabs.pocketahead
```

## Stable emulator recovery in progress

Only the defective API 37.1 image was installed. A stable Android 16 / API 36 Google Play x86_64 image download was started:

```powershell
& 'C:\Users\Harris\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat' 'system-images;android-36;google_apis_playstore;x86_64'
```

The download did not finish before this handoff. The partial installation currently contains an `.installer` directory under:

```text
C:\Users\Harris\AppData\Local\Android\Sdk\system-images\android-36\google_apis_playstore\x86_64
```

At handoff time, `adb devices` showed no connected emulator and Metro was not listening on port 8081.

## Exact next steps

1. Finish the stable image installation by rerunning the `sdkmanager` command above.
2. Create a separate AVD so no existing emulator data is wiped:

   ```powershell
   'no' | & 'C:\Users\Harris\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat' create avd --force --name 'PocketAhead_Stable' --package 'system-images;android-36;google_apis_playstore;x86_64' --device 'pixel_7'
   ```

3. Start that AVD from Android Studio Device Manager, or:

   ```powershell
   Start-Process -FilePath 'C:\Users\Harris\AppData\Local\Android\Sdk\emulator\emulator.exe' -ArgumentList '-avd','PocketAhead_Stable','-no-snapshot-load' -WindowStyle Hidden
   ```

4. Start Metro from the repository root:

   ```powershell
   npx expo start --dev-client --port 8081
   ```

5. When the emulator reports `sys.boot_completed=1`, connect Metro and install the already-built APK:

   ```powershell
   $adb='C:\Users\Harris\AppData\Local\Android\Sdk\platform-tools\adb.exe'
   & $adb devices -l
   & $adb reverse tcp:8081 tcp:8081
   & $adb install -r -d -t 'C:\Users\Harris\Documents\Ultimate AI\Pocket Ahead\finpath\android\app\build\outputs\apk\debug\app-debug.apk'
   ```

6. Launch the exact current package:

   ```powershell
   & $adb shell am start -n 'com.kaellabs.pocketahead/.MainActivity'
   ```

7. Verify all of the following before declaring success:

   - No red `ExpoCrypto` error screen.
   - Foreground package is `com.kaellabs.pocketahead`.
   - Welcome/auth or dashboard UI visibly renders.
   - `adb logcat` has no `AndroidRuntime` fatal exception or `ReactNativeJS` uncaught error.
   - Capture a screenshot as visual evidence.

## Preserve these uncommitted source changes

Do not reset or overwrite these files:

```text
 M src/app/(tabs)/dashboard/index.tsx
 M src/app/(tabs)/goals/index.tsx
 M src/app/onboarding/review.tsx
?? src/__tests__/activeFinancialPlan.test.ts
?? src/features/financial-engine/activeFinancialPlan.ts
```

Diagnostic logs created during this mount attempt:

```text
?? .metro-android.err
?? .metro-android.out
```

They are not application source. Leave them alone unless the user explicitly approves deleting them.

## Validation already completed before this mount attempt

Earlier checks passed:

- TypeScript compilation
- Lint
- Jest: 32 suites / 152 tests

These checks do not replace the still-required stable-emulator visual/runtime smoke test.

## Honest current verdict

The current source has not been proven broken by this incident. The observed red screen came from a stale native APK, and installation of the fresh successful build was blocked by a defective API 37.1 emulator system image. The next conversation should finish the API 36 AVD setup and perform the visible runtime verification above.
