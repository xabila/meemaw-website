# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Players & Families (`meemaw.app/hunter/`)**: iPhone and iPad owners (ages 9 to adult) looking for an immediate, physical, controller-free arcade shooter they can play at arm's length using real hand gestures—solo or projected wirelessly onto a 16:9 living-room TV via AirPlay.
- **Learners, Students & Parents (`meemaw.app/` & `meemaw.app/math/`)**: French learners, middle-school students, and families using Sheriff/Grandma Meemaw's companion apps for studio voice dictation (*Meemaw*) and mental math / no-calculator exam fluency (*Meemaw Math*).
- **App Store Reviewers & Privacy-Conscious Visitors (`meemaw.app/hunter/privacy.html`)**: Visitors verifying how *Meemaw Hunter* processes 60 FPS front-camera video, what stays on-device, and how the one-time family unlock works.

## Product Purpose

`meemaw.app` is the official web home of the **Meemaw** iOS & iPadOS family suite created by Xavier Larrodé, with `/hunter/` serving as the dedicated showcase and legal/privacy hub for **Meemaw Hunter** (App Store ID `6831648316`, Bundle ID `com.xlarrodeapp.meemawhunter`). Success on `/hunter/` means a visitor understands the 3-gesture camera mechanism within seconds, trusts that 100% of camera processing stays on their iPhone, and installs via the App Store or joins the public TestFlight beta in their own language.

## Positioning

Unlike touch-tap gallery shooters or VR games requiring headsets and plastic peripherals, **Meemaw Hunter** turns any iPhone (from iPhone SE to iPhone 17 Pro's 18 MP square Center Stage camera) into a 60 FPS optical hand-tracked arcade cabinet—playable **handheld** (holding your iPhone in your left hand and shooting with your right hand, or vice versa for left-handed players) or **propped in front of you**—using three unmistakable physical gestures:
1. **Open Hand** facing the screen to aim with sub-pixel optical smoothing.
2. **Close Fist** to fire with recoil-stabilized hit detection.
3. **Flip Wrist** in place (palm ↔ back of hand) to reload the 6-shot cylinder without losing aim.

## Operating Context

- Static HTML/CSS/JS site deployed at `https://meemaw.app/` (`CNAME: meemaw.app`, GitHub Pages, `.nojekyll`).
- Sub-application routes live alongside the root app (`/math/` for *Meemaw Math*, `/hunter/` for *Meemaw Hunter*), sharing cross-app family wayfinding while letting each app carry its own signature chapter palette.
- Multilingual international audience across **8 web languages** covering all **13 App Store Connect locales**: Français (`fr`: `fr-FR`, `fr-CA`), English (`en`: `en-US`, `en-GB`, `en-CA`, `en-AU`), Español (`es`: `es-ES`, `es-MX`), Deutsch (`de`: `de-DE`), Italiano (`it`), Português (`pt-br`: `pt-BR`), 日本語 (`ja`), and 한국어 (`ko`).

## Capabilities and Constraints

- **7 Playable Texas Worlds + High Noon Boss Duels**: Ball-Trap Ranch, Barn Ambush, UFO Night, Canyon Saloon, Flashlight Swamp, Reflex Gold Mine, and 1885 Steam Train Heist.
- **4 Arcade Weapons & Sharpshooter Streaks**: Classic 6-Shot Colt, 3-Pellet Shotgun, 3-Round Burst Moozzi, Area Bazooka, Frying-Pan Headshots, Flying Dynamite, and Chili Fury (`2×` slow-motion streak).
- **AirPlay TV 16:9 Living-Room Mode**: Native dual-screen `UIWindowScene` rendering a full 16:9 stage on the TV while the iPhone sits centered directly underneath the television (facing the player) as a dedicated hand-tracking cockpit.
- **Honest Family Monetization**: Free download including the interactive 6-step calibration tutorial plus Worlds 1 & 2; optional one-time Lifetime **Sheriff Pack** (`com.xlarrodeapp.meemawhunter.sheriffpack`, `3,99 €` / `$3.99`) with Apple Family Sharing (up to 6 family members) and zero subscriptions or ads.
- **Strict On-Device Privacy (`DATA_NOT_COLLECTED`)**: `MediaPipeTasksVision` runs 100% locally on the iPhone/iPad Neural Engine/CPU. Zero camera frames or images are ever recorded, saved to disk, or transmitted; zero analytics SDKs or ad trackers exist in *Meemaw Hunter*.

## Brand Commitments

- Extend the established `meemaw.app` family identity with a dedicated **Texas Sunset & Sheriff Gold** chapter palette (`#F7B928` Sheriff Gold, `#C93B2B` Barn Chili Red, `#18794E` Armed Emerald, `#1F130C` Espresso Saloon Timber, `#FFFDF9` Sunlit Paper) and cross-app navigation linking *Meemaw*, *Meemaw Math*, and *Meemaw Hunter*.
- Primary CTA targets the official App Store listing (`https://apps.apple.com/app/id6831648316`), paired with a secondary public TestFlight beta CTA (`https://testflight.apple.com/join/KDkGehjG`).
- Zero fabricated ratings, fake press quotes, or unverified customer counts on *Meemaw Hunter* (which is in active v1.0 launch / TestFlight).

## Evidence on Hand

- Production game sprites & stage plates in `/Users/xabi/DEV/CowHunter/CowHunter/Assets.xcassets` (`AppIcon.png`, `MeemawSheriffAvatar.png`, 5 critter cutouts, golden pie & heart sprites, 3 gesture medallions `GrabPoseIcon.jpg`, `ShootFistIcon.jpg`, `ReloadFingersIcon.jpg`, `OnboardingGrabGuide.jpg`, and 7 painted Texas stage backgrounds).
- Living-room AirPlay TV scene (`airplay_tv_authentic_under_tv.jpg`, showing the iPhone centered directly under the 16:9 TV with open-hand aiming) and 8-language localized iPhone & iPad App Store screenshots in `/Users/xabi/DEV/CowHunter/Marketing/screenshots_export/`.
- Confirmed zero-collection `Podfile` (sole dependency: local `MediaPipeTasksVision`) and `PrivacyInfo.xcprivacy`.

## Product Principles

1. **Demonstrate the physical gesture in the first viewport** rather than describing "AI camera technology" in abstract prose.
2. **Make on-device camera privacy verifiable and unambiguous** in both the product page and the multilingual legal documentation.
3. **Treat all 8 supported languages as first-class**—translating interface copy, legal commitments, and screenshot showcases together without layout overflow.
4. **Preserve family clarity**—no dark patterns, no recurring subscriptions, no ads, and instant cross-navigation across the three Meemaw apps.
