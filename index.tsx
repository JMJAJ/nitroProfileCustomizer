import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

// Plugin settings - these let users customize their profile without actually having Nitro
const settings = definePluginSettings({
    userId: {
        type: OptionType.STRING,
        description: "Your Discord User ID (the profile to customize)",
        default: ""
    },
    enableCustomization: {
        type: OptionType.BOOLEAN,
        description: "Enable local nitro profile customization",
        default: true
    },
    customBanner: {
        type: OptionType.STRING,
        description: "Custom banner URL (leave empty to use color)",
        default: ""
    },
    customBannerColor: {
        type: OptionType.STRING,
        description: "Custom banner color (hex code, e.g., #ff0000)",
        default: "#5865f2"
    },
    customAvatar: {
        type: OptionType.STRING,
        description: "Custom avatar URL (leave empty to disable)",
        default: ""
    },
    customAvatarDecoration: {
        type: OptionType.STRING,
        description: "Custom avatar decoration URL (leave empty to disable)",
        default: ""
    },
    customDisplayName: {
        type: OptionType.STRING,
        description: "Custom display name (leave empty to use original)",
        default: ""
    },
    customBio: {
        type: OptionType.STRING,
        description: "Custom bio/about me text (leave empty to use original)",
        default: ""
    },
    customStatus: {
        type: OptionType.STRING,
        description: "Custom status text (leave empty to use original)",
        default: ""
    },
    enableProfileTheme: {
        type: OptionType.BOOLEAN,
        description: "Enable custom profile theme colors",
        default: true
    },
    primaryColor: {
        type: OptionType.STRING,
        description: "Primary theme color (hex code)",
        default: "#3d0000"
    },
    secondaryColor: {
        type: OptionType.STRING,
        description: "Secondary theme color (hex code)",
        default: "#000000"
    },
    backgroundOpacity: {
        type: OptionType.SLIDER,
        description: "Background opacity (0 = transparent, 100 = solid)",
        default: 95,
        markers: [0, 25, 50, 75, 100],
        stickToMarkers: false
    },
    enableProfileEffect: {
        type: OptionType.BOOLEAN,
        description: "Enable custom profile effect overlay",
        default: false
    },
    profileEffectUrl: {
        type: OptionType.STRING,
        description: "Profile effect intro image/gif URL (plays once)",
        default: ""
    },
    profileEffectLoopUrl: {
        type: OptionType.STRING,
        description: "Profile effect loop image/gif URL (plays after intro)",
        default: ""
    },
    profileEffectIntroDuration: {
        type: OptionType.SLIDER,
        description: "Intro effect duration in seconds (before switching to loop)",
        default: 4,
        markers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        stickToMarkers: false
    },
    enableGlow: {
        type: OptionType.BOOLEAN,
        description: "Enable nitro-like glow effects",
        default: false
    },
    enableAnimations: {
        type: OptionType.BOOLEAN,
        description: "Enable smooth animations and transitions",
        default: true
    },
    enableNameplate: {
        type: OptionType.BOOLEAN,
        description: "Enable custom nameplate background",
        default: false
    },
    nameplateColor: {
        type: OptionType.STRING,
        description: "Nameplate gradient color (hex code, e.g., #0131c2)",
        default: "#0131c2"
    },
    nameplateVideo: {
        type: OptionType.STRING,
        description: "Nameplate video URL (.webm, leave empty for gradient only)",
        default: ""
    },
    nameplatePoster: {
        type: OptionType.STRING,
        description: "Nameplate static poster image URL (.png)",
        default: ""
    },
    enableDisplayNameStyle: {
        type: OptionType.BOOLEAN,
        description: "Enable custom display name styling",
        default: false
    },
    displayNameFont: {
        type: OptionType.SELECT,
        description: "Display name font",
        options: [
            { label: "gg sans (Default)", value: "default", default: true },
            { label: "Tempo", value: "zillaSlab" },
            { label: "Sakura", value: "cherryBomb" },
            { label: "Jellybean", value: "chicle" },
            { label: "Modern", value: "museoModerno" },
            { label: "Medieval", value: "neoCastel" },
            { label: "8Bit", value: "pixelify" },
            { label: "Vampyre", value: "sinistre" }
        ]
    },
    displayNameEffect: {
        type: OptionType.SELECT,
        description: "Display name effect",
        options: [
            { label: "Solid", value: "solid", default: true },
            { label: "Gradient", value: "gradient" },
            { label: "Neon", value: "neon" },
            { label: "Toon", value: "toon" },
            { label: "Pop", value: "pop" }
        ]
    },
    displayNameColor: {
        type: OptionType.STRING,
        description: "Display name main color (hex code, e.g., #efeff0)",
        default: "#efeff0"
    },
    displayNameGradientEnd: {
        type: OptionType.STRING,
        description: "Display name gradient end color (for gradient effect, hex code)",
        default: "#5ccfba"
    }
});

// Keep track of our injected styles so we can clean them up later
let styleElement: HTMLStyleElement | null = null;
// Debounce style applications to avoid hammering the DOM when profiles rapidly open/close
let applyStylesTimeout: number | null = null;

function hexToRgb(hex: string): { r: number; g: number; b: number; } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 88, g: 101, b: 242 };
}

// Discord's profile themes use HSL for gradients, so we need to convert hex colors
function hexToHsl(hex: string): string {
    const { r: rVal, g: gVal, b: bVal } = hexToRgb(hex);
    const r = rVal / 255;
    const g = gVal / 255;
    const b = bVal / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

function getRgbaString(hex: string, opacity: number): string {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Find and mark the user's own profile so we only customize theirs, not everyone's
function markTargetProfile() {
    const profiles = document.querySelectorAll('.outer_c0bea0.user-profile-popout, .outer_c0bea0.user-profile-modal-v2');

    profiles.forEach(profile => {
        profile.classList.remove('custom-profile-target');

        // Check if this profile belongs to the configured user by looking at their avatar URL
        let isTarget = false;
        const avatarElement = profile.querySelector('.avatar__44b0c[src], .avatar__44b0c[style]');

        if (avatarElement) {
            const src = avatarElement.getAttribute('src') || '';
            const style = avatarElement.getAttribute('style') || '';
            if (src.includes(settings.store.userId) || style.includes(settings.store.userId)) {
                isTarget = true;
            }
        }

        if (isTarget) {
            profile.classList.add('custom-profile-target');
            applyDirectStyles(profile as HTMLElement);
            applyDirectBannerChange(profile as HTMLElement);
            applyDirectAvatarChange(profile as HTMLElement);
            applyProfileEffect(profile as HTMLElement);

            // Hide the "Add a status" prompt since we're showing a custom status
            const addStatusContainer = profile.querySelector('.container_ab8609.editable_ab8609');
            if (addStatusContainer) (addStatusContainer as HTMLElement).style.display = 'none';
        }
    });
}

// Apply banner changes directly to the DOM (CSS alone isn't enough due to inline styles)
function applyDirectBannerChange(profile: HTMLElement) {
    const bannerElements = profile.querySelectorAll('.banner__68edb');

    bannerElements.forEach(banner => {
        const bannerEl = banner as HTMLElement;

        // Image takes priority over color
        if (settings.store.customBanner?.trim()) {
            bannerEl.style.setProperty('background-image', `url("${settings.store.customBanner}")`, 'important');
            bannerEl.style.setProperty('background-size', 'cover', 'important');
            bannerEl.style.setProperty('background-position', 'center center', 'important');
            bannerEl.style.setProperty('background-repeat', 'no-repeat', 'important');
            bannerEl.style.removeProperty('background-color');
        } else if (settings.store.customBannerColor?.trim()) {
            bannerEl.style.setProperty('background-color', settings.store.customBannerColor, 'important');
            bannerEl.style.setProperty('background-image', 'none', 'important');
        }
    });

    // Apply banner as background image to the profile container (fullscreen modal only)
    // Create a backgroundImage__9c3be div like Nitro users have for the fade effect
    if (settings.store.customBanner?.trim() && profile.classList.contains('user-profile-modal-v2')) {
        const innerContainer = profile.querySelector('.inner_c0bea0') as HTMLElement;
        if (innerContainer) {
            // Check if we already created the background div
            let backgroundDiv = innerContainer.querySelector('.backgroundImage__9c3be') as HTMLElement;

            if (!backgroundDiv) {
                backgroundDiv = document.createElement('div');
                backgroundDiv.className = 'backgroundImage__9c3be';
                // Insert at the beginning so it's behind everything
                innerContainer.insertBefore(backgroundDiv, innerContainer.firstChild);
            }

            // Apply the background to this div instead of the container
            backgroundDiv.style.setProperty('background-image', `url("${settings.store.customBanner}")`, 'important');
            backgroundDiv.style.setProperty('background-size', 'cover', 'important');
            backgroundDiv.style.setProperty('background-position', 'center center', 'important');
            backgroundDiv.style.setProperty('background-repeat', 'no-repeat', 'important');

            // Remove background from the container itself
            innerContainer.style.removeProperty('background-image');
        }
    }
}

// Replace avatar and decoration images - need to update both src and inline styles
function applyDirectAvatarChange(profile: HTMLElement) {
    if (settings.store.customAvatar?.trim()) {
        const avatarImgs = profile.querySelectorAll('.avatar__44b0c[src]');
        avatarImgs.forEach(img => {
            (img as HTMLImageElement).src = settings.store.customAvatar;
            // Some avatars use background-image in inline styles
            const style = img.getAttribute('style') || '';
            const newStyle = style.replace(/url\([^)]+\)/g, `url(${settings.store.customAvatar})`);
            img.setAttribute('style', newStyle);
        });
    }

    if (settings.store.customAvatarDecoration?.trim()) {
        // Discord uses different class names for decorations, so we check all of them
        const decorationSelectors = [
            '.avatarDecoration__44b0c img',
            '.avatarDecoration_c19a55',
            'img.avatarDecoration_c19a55',
            '.avatarDecoration__44b0c'
        ];

        decorationSelectors.forEach(selector => {
            const decorationImgs = profile.querySelectorAll(selector);
            decorationImgs.forEach(img => {
                (img as HTMLImageElement).src = settings.store.customAvatarDecoration;
            });
        });
    }
}

// Profile effects are those animated overlays Nitro users get (like sparkles, snow, etc.)
function applyProfileEffect(profile: HTMLElement) {
    if (!settings.store.enableProfileEffect || !settings.store.profileEffectUrl?.trim()) {
        const existingEffect = profile.querySelector('.custom-profile-effect-container');
        if (existingEffect) existingEffect.remove();
        return;
    }

    let effectContainer = profile.querySelector('.custom-profile-effect-container') as HTMLElement;
    // Don't re-initialize if we already set this up
    if (effectContainer && effectContainer.hasAttribute('data-effect-initialized')) {
        return;
    }

    if (!effectContainer) {
        effectContainer = document.createElement('div');
        effectContainer.className = 'profileEffects__01370 custom-profile-effect-container';
        effectContainer.setAttribute('aria-label', 'Show this effect when others view your profile.');
        effectContainer.setAttribute('role', 'img');

        const innerDiv = document.createElement('div');
        innerDiv.className = 'inner__01370';

        // Support two-part effects: intro plays once, then seamlessly transitions to a loop
        if (settings.store.profileEffectLoopUrl?.trim()) {
            const introImg = document.createElement('img');
            introImg.className = 'effect__01370 effect-intro';
            introImg.alt = '';
            introImg.setAttribute('aria-hidden', 'true');
            introImg.src = settings.store.profileEffectUrl;
            introImg.style.top = '0px';

            const loopImg = document.createElement('img');
            loopImg.className = 'effect__01370 effect-loop';
            loopImg.alt = '';
            loopImg.setAttribute('aria-hidden', 'true');
            loopImg.src = settings.store.profileEffectLoopUrl;
            loopImg.style.top = '0px';
            loopImg.style.opacity = '0';

            innerDiv.appendChild(introImg);
            innerDiv.appendChild(loopImg);

            // Fade from intro to loop after the configured duration
            introImg.addEventListener('load', () => {
                const duration = (settings.store.profileEffectIntroDuration || 4) * 1000;
                setTimeout(() => {
                    introImg.style.opacity = '0';
                    loopImg.style.opacity = '1';
                }, duration);
            });
        } else {
            const effectImg = document.createElement('img');
            effectImg.className = 'effect__01370';
            effectImg.alt = '';
            effectImg.setAttribute('aria-hidden', 'true');
            effectImg.src = settings.store.profileEffectUrl;
            effectImg.style.top = '0px';
            innerDiv.appendChild(effectImg);
        }

        effectContainer.appendChild(innerDiv);
        effectContainer.setAttribute('data-effect-initialized', 'true');

        // For fullscreen modal, place in .profile__9c3be to cover both header and body
        const profileContainer = profile.querySelector('.profile__9c3be');
        if (profileContainer && profile.classList.contains('user-profile-modal-v2')) {
            profileContainer.appendChild(effectContainer);
        } else {
            const innerContainer = profile.querySelector('.inner_c0bea0');
            if (innerContainer) {
                innerContainer.appendChild(effectContainer);
            }
        }
    }
}

// Apply theme colors directly to the profile element using CSS variables Discord expects
function applyDirectStyles(profile: HTMLElement) {
    if (!settings.store.enableProfileTheme) return;

    const opacity = settings.store.backgroundOpacity / 100;
    const primaryHsl = hexToHsl(settings.store.primaryColor);
    const secondaryHsl = hexToHsl(settings.store.secondaryColor);
    const primary = getRgbaString(settings.store.primaryColor, opacity);
    const secondary = getRgbaString(settings.store.secondaryColor, opacity);

    profile.classList.add('custom-theme-background', 'custom-user-profile-theme');

    // Set Discord's CSS variables so buttons and other elements match the theme
    profile.style.setProperty('--profile-gradient-primary-color', `hsla(${primaryHsl}, 1)`, 'important');
    profile.style.setProperty('--profile-gradient-secondary-color', `hsla(${secondaryHsl}, 1)`, 'important');
    profile.style.setProperty('--profile-gradient-overlay-color', getRgbaString('#000000', 0.6), 'important');
    profile.style.setProperty('--profile-gradient-button-color', `hsla(${primaryHsl}, 0.8)`, 'important');

    profile.style.background = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    profile.style.backgroundColor = settings.store.primaryColor;
}


// Nameplates are the colored backgrounds behind your name in member lists and DMs
function generateNameplateCSS(): string {
    if (!settings.store.enableNameplate) return "";

    const css: string[] = [];
    const userId = settings.store.userId;
    const { r, g, b } = hexToRgb(settings.store.nameplateColor);

    // Style member list entries with a gradient background
    css.push(`
        .member__5d473:has(.avatar__91a9d img[src*="${userId}"]) .childContainer__91a9d,
        .member__5d473:has(.avatar__91a9d img[style*="${userId}"]) .childContainer__91a9d {
            position: relative !important;
        }
        .member__5d473:has(.avatar__91a9d img[src*="${userId}"]) .childContainer__91a9d::before,
        .member__5d473:has(.avatar__91a9d img[style*="${userId}"]) .childContainer__91a9d::before {
            content: "" !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: linear-gradient(90deg, transparent 0%, rgba(${r}, ${g}, ${b}, 0.08) 20%, rgba(${r}, ${g}, ${b}, 0.08) 50%, rgba(${r}, ${g}, ${b}, 0.2) 100%) !important;
            pointer-events: none !important;
            z-index: 0 !important;
        }
        .member__5d473:has(.avatar__91a9d img[src*="${userId}"]) .memberInner__5d473 {
            position: relative !important;
            z-index: 1 !important;
        }
    `);

    // Same gradient for DM channels in the sidebar
    css.push(`
        .channel__972a0:has(.avatar__44b0c[src*="${userId}"]) .interactive__972a0,
        .channel__972a0:has(.avatar__44b0c[style*="${userId}"]) .interactive__972a0 {
            position: relative !important;
        }
        .channel__972a0:has(.avatar__44b0c[src*="${userId}"]) .interactive__972a0::before,
        .channel__972a0:has(.avatar__44b0c[style*="${userId}"]) .interactive__972a0::before {
            content: "" !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: linear-gradient(90deg, transparent 0%, rgba(${r}, ${g}, ${b}, 0.08) 20%, rgba(${r}, ${g}, ${b}, 0.08) 50%, rgba(${r}, ${g}, ${b}, 0.2) 100%) !important;
            pointer-events: none !important;
            z-index: 0 !important;
        }
        .channel__972a0:has(.avatar__44b0c[src*="${userId}"]) .layout__20a53 {
            position: relative !important;
            z-index: 1 !important;
        }
    `);

    if (settings.store.nameplateVideo?.trim()) {
        css.push(`
            .custom-nameplate-video-container {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                overflow: hidden !important;
                pointer-events: none !important;
                z-index: 0 !important;
            }
            .custom-nameplate-video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                opacity: 0.8 !important;
                mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.3) 40%, rgb(0, 0, 0) 70%) !important;
                -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.3) 40%, rgb(0, 0, 0) 70%) !important;
            }
        `);
    }

    return css.join('\n');
}

// Inject display name styling classes into username elements
function injectDisplayNameStyles() {
    if (!settings.store.enableDisplayNameStyle) return;

    const userId = settings.store.userId;
    const font = settings.store.displayNameFont;
    const effect = settings.store.displayNameEffect;

    // Profile display names
    const profileNames = document.querySelectorAll(`.outer_c0bea0:has(.avatar__44b0c[src*="${userId}"]) .nickname__63ed3, .outer_c0bea0:has(.avatar__44b0c[style*="${userId}"]) .nickname__63ed3`);
    profileNames.forEach(nameEl => {
        if (nameEl.querySelector('.nicknameWithDisplayNameStyles__63ed3')) return;

        const displayName = nameEl.textContent || "";
        const container = document.createElement('div');
        container.className = `container_dfb989 nicknameWithDisplayNameStyles__63ed3 showEffect_dfb989 animated_dfb989 loop_dfb989 inProfile_dfb989 ${font !== "default" ? `dnsFont__89a31 ${font}__89a31` : ""}`;

        const inner = document.createElement('span');
        inner.className = `innerContainer_dfb989 ${effect}_dfb989`;
        inner.setAttribute('data-username-with-effects', displayName);
        inner.textContent = displayName;

        container.appendChild(inner);

        if (effect === "neon") {
            const glow = document.createElement('span');
            glow.className = 'glowContainer_dfb989 innerContainer_dfb989 neonGlow_dfb989';
            glow.setAttribute('aria-hidden', 'true');
            glow.textContent = displayName;
            container.appendChild(glow);
        }

        nameEl.innerHTML = '';
        nameEl.appendChild(container);
    });

    // Member list display names
    const memberNames = document.querySelectorAll(`.member__5d473:has(.avatar__91a9d img[src*="${userId}"]) .username__5d473 .name__5d473, .member__5d473:has(.avatar__91a9d img[style*="${userId}"]) .username__5d473 .name__5d473`);
    memberNames.forEach(nameEl => {
        if (nameEl.querySelector('.container_dfb989')) return;

        const displayName = nameEl.textContent?.trim() || "";
        const container = document.createElement('div');
        container.className = `container_dfb989 ${font !== "default" ? `dnsFont__89a31 ${font}__89a31` : ""} showEffect_dfb989 loop_dfb989`;

        const inner = document.createElement('span');
        inner.className = `innerContainer_dfb989 ${effect}_dfb989`;
        inner.setAttribute('data-username-with-effects', displayName);
        inner.textContent = displayName;

        container.appendChild(inner);

        if (effect === "neon") {
            const glow = document.createElement('span');
            glow.className = 'glowContainer_dfb989 innerContainer_dfb989 neonGlow_dfb989';
            glow.setAttribute('aria-hidden', 'true');
            glow.textContent = displayName;
            container.appendChild(glow);
        }

        nameEl.innerHTML = '';
        nameEl.appendChild(container);
    });
}

// Inject video backgrounds into nameplates (like those animated Nitro nameplate effects)
function injectNameplateVideos() {
    if (!settings.store.enableNameplate || !settings.store.nameplateVideo?.trim()) return;

    const userId = settings.store.userId;

    const memberElements = document.querySelectorAll(`.member__5d473:has(.avatar__91a9d img[src*="${userId}"]), .member__5d473:has(.avatar__91a9d img[style*="${userId}"])`);
    memberElements.forEach(member => {
        const container = member.querySelector('.childContainer__91a9d');
        // Skip if we already injected the video
        if (!container || container.querySelector('.custom-nameplate-video-container')) return;

        const videoContainer = document.createElement('div');
        videoContainer.className = 'custom-nameplate-video-container';

        const video = document.createElement('video');
        video.className = 'custom-nameplate-video';
        video.src = settings.store.nameplateVideo;
        if (settings.store.nameplatePoster?.trim()) {
            video.poster = settings.store.nameplatePoster;
        }
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        videoContainer.appendChild(video);
        container.insertBefore(videoContainer, container.firstChild);
    });

    const dmElements = document.querySelectorAll(`.channel__972a0:has(.avatar__44b0c[src*="${userId}"]), .channel__972a0:has(.avatar__44b0c[style*="${userId}"])`);
    dmElements.forEach(dm => {
        const interactive = dm.querySelector('.interactive__972a0');
        if (!interactive || interactive.querySelector('.custom-nameplate-video-container')) return;

        const videoContainer = document.createElement('div');
        videoContainer.className = 'custom-nameplate-video-container';

        const video = document.createElement('video');
        video.className = 'custom-nameplate-video';
        video.src = settings.store.nameplateVideo;
        if (settings.store.nameplatePoster?.trim()) {
            video.poster = settings.store.nameplatePoster;
        }
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        videoContainer.appendChild(video);
        interactive.insertBefore(videoContainer, interactive.firstChild);
    });
}

function generateDisplayNameCSS(): string {
    if (!settings.store.enableDisplayNameStyle) return "";

    const css: string[] = [];
    const userId = settings.store.userId;
    const font = settings.store.displayNameFont;
    const effect = settings.store.displayNameEffect;
    const mainColor = settings.store.displayNameColor;
    const { r, g, b } = hexToRgb(mainColor);

    // Calculate light and dark variants for effects
    const light1 = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;
    const light2 = `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`;
    const dark1 = `rgb(${Math.max(r - 80, 0)}, ${Math.max(g - 80, 0)}, ${Math.max(b - 80, 0)})`;
    const dark2 = `rgb(${Math.max(r - 120, 0)}, ${Math.max(g - 120, 0)}, ${Math.max(b - 120, 0)})`;

    // Profile display name
    css.push(`
        .outer_c0bea0:has(.avatar__44b0c[src*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3,
        .outer_c0bea0:has(.avatar__44b0c[style*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 {
            --custom-display-name-styles-main-color: ${mainColor} !important;
            --custom-display-name-styles-light-1-color: ${light1} !important;
            --custom-display-name-styles-light-2-color: ${light2} !important;
            --custom-display-name-styles-dark-1-color: ${dark1} !important;
            --custom-display-name-styles-dark-2-color: ${dark2} !important;
            --custom-display-name-styles-wrap: wrap !important;
            --custom-display-name-styles-font-opacity: 1 !important;
        }
    `);

    if (effect === "gradient") {
        css.push(`
            .outer_c0bea0:has(.avatar__44b0c[src*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3,
            .outer_c0bea0:has(.avatar__44b0c[style*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 {
                --custom-display-name-styles-gradient-start-color: ${mainColor} !important;
                --custom-display-name-styles-gradient-end-color: ${settings.store.displayNameGradientEnd} !important;
            }
        `);
    }

    css.push(`
        .outer_c0bea0:has(.avatar__44b0c[src*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 .innerContainer_dfb989,
        .outer_c0bea0:has(.avatar__44b0c[style*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 .innerContainer_dfb989 {
            ${font !== "default" ? `font-family: var(--font-display) !important;` : ""}
        }
    `);

    if (font !== "default") {
        css.push(`
            .outer_c0bea0:has(.avatar__44b0c[src*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3,
            .outer_c0bea0:has(.avatar__44b0c[style*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 {
                font-family: var(--font-display) !important;
            }
            .outer_c0bea0:has(.avatar__44b0c[src*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 .innerContainer_dfb989,
            .outer_c0bea0:has(.avatar__44b0c[style*="${userId}"]) .nicknameWithDisplayNameStyles__63ed3 .innerContainer_dfb989 {
                font-family: var(--font-display) !important;
            }
        `);
    }

    // Member list display name
    css.push(`
        .member__5d473:has(.avatar__91a9d img[src*="${userId}"]) .container_dfb989,
        .member__5d473:has(.avatar__91a9d img[style*="${userId}"]) .container_dfb989 {
            --custom-display-name-styles-main-color: ${mainColor} !important;
            --custom-display-name-styles-light-1-color: ${light1} !important;
            --custom-display-name-styles-light-2-color: ${light2} !important;
            --custom-display-name-styles-dark-1-color: ${dark1} !important;
            --custom-display-name-styles-dark-2-color: ${dark2} !important;
            --custom-display-name-styles-wrap: nowrap !important;
            --custom-display-name-styles-font-opacity: 1 !important;
        }
    `);

    if (effect === "gradient") {
        css.push(`
            .member__5d473:has(.avatar__91a9d img[src*="${userId}"]) .container_dfb989,
            .member__5d473:has(.avatar__91a9d img[style*="${userId}"]) .container_dfb989 {
                --custom-display-name-styles-gradient-start-color: ${mainColor} !important;
                --custom-display-name-styles-gradient-end-color: ${settings.store.displayNameGradientEnd} !important;
            }
        `);
    }

    // Chat message display name
    css.push(`
        .message__5126c[data-author-id="${userId}"] .username_c19a55 .container_dfb989,
        .wrapper_c19a55[data-author-id="${userId}"] .username_c19a55 .container_dfb989 {
            --custom-display-name-styles-main-color: ${mainColor} !important;
            --custom-display-name-styles-light-1-color: ${light1} !important;
            --custom-display-name-styles-light-2-color: ${light2} !important;
            --custom-display-name-styles-dark-1-color: ${dark1} !important;
            --custom-display-name-styles-dark-2-color: ${dark2} !important;
            --custom-display-name-styles-wrap: nowrap !important;
            --custom-display-name-styles-font-opacity: 1 !important;
        }
    `);

    if (effect === "gradient") {
        css.push(`
            .message__5126c[data-author-id="${userId}"] .username_c19a55 .container_dfb989,
            .wrapper_c19a55[data-author-id="${userId}"] .username_c19a55 .container_dfb989 {
                --custom-display-name-styles-gradient-start-color: ${mainColor} !important;
                --custom-display-name-styles-gradient-end-color: ${settings.store.displayNameGradientEnd} !important;
            }
        `);
    }

    return css.join('\n');
}

function generateCustomCSS(): string {
    if (!settings.store.enableCustomization) return "";

    const css: string[] = [];
    const sel = '.outer_c0bea0.custom-profile-target';
    const opacity = settings.store.backgroundOpacity / 100;

    if (settings.store.customBanner?.trim()) {
        css.push(`
            ${sel} .banner__68edb,
            ${sel} .banner__68edb[style] {
                background-image: url("${settings.store.customBanner}") !important;
                background-size: cover !important;
                background-position: center center !important;
                background-repeat: no-repeat !important;
                min-height: 105px !important;
                height: 105px !important;
            }
        `);
    } else if (settings.store.customBannerColor?.trim()) {
        css.push(`
            ${sel} .banner__68edb,
            ${sel} .banner__68edb[style] {
                background-color: ${settings.store.customBannerColor} !important;
                background-image: none !important;
                min-height: 105px !important;
                height: 105px !important;
            }
        `);
    }

    // Replace display name by covering it with a ::before pseudo-element (hacky but works)
    if (settings.store.customDisplayName?.trim()) {
        css.push(`
            ${sel} .nickname__63ed3 { position: relative !important; overflow: hidden !important; }
            ${sel} .nickname__63ed3::before {
                content: "${settings.store.customDisplayName}" !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: var(--background-primary) !important;
                display: flex !important;
                align-items: center !important;
                z-index: 999 !important;
                color: var(--header-primary) !important;
                font-weight: bold !important;
                font-size: inherit !important;
            }
        `);
    }

    if (settings.store.customBio?.trim()) {
        css.push(`
            ${sel} .markup__75297 span { position: relative !important; overflow: hidden !important; }
            ${sel} .markup__75297 span::before {
                content: "${settings.store.customBio}" !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                min-height: 100% !important;
                background: var(--background-primary) !important;
                display: block !important;
                z-index: 999 !important;
                color: var(--header-primary) !important;
                padding: inherit !important;
                line-height: inherit !important;
            }
        `);
    }

    if (settings.store.customStatus?.trim()) {
        css.push(`
            ${sel} .addStatusPrompt_ab8609 { position: relative !important; overflow: hidden !important; }
            ${sel} .addStatusPrompt_ab8609::before {
                content: "${settings.store.customStatus}" !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: var(--background-primary) !important;
                display: flex !important;
                align-items: center !important;
                z-index: 999 !important;
                color: var(--text-normal) !important;
                padding: inherit !important;
            }
        `);
    }

    if (settings.store.enableProfileTheme) {
        const primaryHsl = hexToHsl(settings.store.primaryColor);
        const secondaryHsl = hexToHsl(settings.store.secondaryColor);
        const primary = getRgbaString(settings.store.primaryColor, opacity);
        const secondary = getRgbaString(settings.store.secondaryColor, opacity);

        css.push(`
            ${sel} {
                --profile-gradient-primary-color: hsla(${primaryHsl}, 1) !important;
                --profile-gradient-secondary-color: hsla(${secondaryHsl}, 1) !important;
                --profile-gradient-overlay-color: ${getRgbaString('#000000', 0.6)} !important;
                --profile-gradient-button-color: hsla(${primaryHsl}, 0.8) !important;
                background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%) !important;
                background-color: ${settings.store.primaryColor} !important;
            }
            ${sel} .inner_c0bea0 { background: transparent !important; }
        `);
    }

    if (settings.store.enableProfileEffect && settings.store.profileEffectUrl?.trim()) {
        css.push(`
            ${sel} .custom-profile-effect-container {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                pointer-events: none !important;
                z-index: 1000 !important;
                overflow: hidden !important;
            }
            ${sel} .custom-profile-effect-container .inner__01370 {
                position: relative !important;
                width: 100% !important;
                height: 100% !important;
            }
            ${sel} .custom-profile-effect-container .effect__01370 {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                object-fit: cover !important;
                transition: opacity 0.5s ease-in-out !important;
            }
            ${sel} .custom-profile-effect-container .effect-intro {
                z-index: 2 !important;
            }
            ${sel} .custom-profile-effect-container .effect-loop {
                z-index: 1 !important;
            }
        `);
    }

    if (settings.store.enableGlow) {
        css.push(`
            ${sel} {
                box-shadow: 0 0 20px ${getRgbaString(settings.store.primaryColor, 0.4)},
                            0 0 40px ${getRgbaString(settings.store.primaryColor, 0.2)} !important;
            }
            ${sel} .banner__68edb {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
            }
            ${sel} .avatar__75742 {
                filter: drop-shadow(0 0 8px ${getRgbaString(settings.store.primaryColor, 0.6)}) !important;
            }
            ${sel} .nickname__63ed3 {
                text-shadow: 0 2px 8px ${getRgbaString(settings.store.primaryColor, 0.5)} !important;
            }
        `);
    }

    if (settings.store.enableAnimations) {
        css.push(`
            ${sel} { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
            ${sel}:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important; }
            ${sel} .avatar__75742:hover { transform: scale(1.05) !important; }
        `);
    }

    // Add CSS for the backgroundImage__9c3be fade effect
    css.push(`
        ${sel} .backgroundImage__9c3be {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 0 !important;
            pointer-events: none !important;
            mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 0) 60%) !important;
            -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 0) 60%) !important;
        }
    `);

    css.push(`
        ${sel} {
            border-radius: 8px !important;
            overflow: hidden !important;
        }
        ${sel} .container_ab8609.editable_ab8609 { display: none !important; }
        ${sel} .badge__8061a { filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important; }
    `);

    return css.join('\n');
}

// Main function that applies all customizations - called whenever profiles appear
function applyStyles() {
    markTargetProfile();

    // Clean up old styles before injecting new ones
    if (styleElement) {
        styleElement.remove();
        styleElement = null;
    }

    if (!settings.store.enableCustomization) return;

    styleElement = document.createElement('style');
    styleElement.id = 'nitro-profile-customizer';
    styleElement.textContent = generateCustomCSS() + '\n' + generateNameplateCSS() + '\n' + generateDisplayNameCSS();
    document.head.appendChild(styleElement);

    injectDisplayNameStyles();
}

// Watch for profile popups/modals appearing and apply customizations
function startMonitoring() {
    applyStyles();

    // MutationObserver catches when profiles are opened
    const observer = new MutationObserver(() => {
        const profiles = document.querySelectorAll('.outer_c0bea0.user-profile-popout, .outer_c0bea0.user-profile-modal-v2');
        if (profiles.length > 0) {
            // Debounce to avoid spamming style updates
            if (applyStylesTimeout) clearTimeout(applyStylesTimeout);
            applyStylesTimeout = window.setTimeout(() => {
                applyStyles();
                applyStylesTimeout = null;
            }, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback interval in case MutationObserver misses something (Discord's DOM is chaotic)
    setInterval(() => {
        const profiles = document.querySelectorAll('.outer_c0bea0.user-profile-popout, .outer_c0bea0.user-profile-modal-v2');
        if (profiles.length > 0) {
            const customProfiles = document.querySelectorAll('.outer_c0bea0.custom-profile-target');
            if (customProfiles.length === 0) {
                applyStyles();
            }
            injectNameplateVideos();
        }
        injectDisplayNameStyles();
    }, 2000);
}

export default definePlugin({
    name: "Nitro Profile Customizer",
    description: "Customize your Discord profile with Nitro-like features (colors, banners, effects)",
    authors: [Devs.Jxint],
    settings,

    start() {
        startMonitoring();
    },

    // Clean up everything when the plugin is disabled
    stop() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }

        document.querySelectorAll('.outer_c0bea0.custom-profile-target')
            .forEach(profile => profile.classList.remove('custom-profile-target'));
    }
});
