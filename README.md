# Nitro Profile Customizer

A Vencord plugin that lets you customize your Discord profile with Nitro-like features without actually having Nitro. All customizations are local and only visible to you.

## Features

### Profile Customization
- **Custom Banner**: Set a custom banner image or solid color
- **Custom Avatar**: Replace your avatar with any image URL
- **Avatar Decoration**: Add custom avatar decorations
- **Display Name**: Override your display name
- **Bio/About Me**: Set a custom bio text
- **Status**: Add a custom status message

### Profile Themes
- **Theme Colors**: Set primary and secondary gradient colors
- **Background Opacity**: Adjust theme background transparency (0-100%)
- **Glow Effects**: Add Nitro-like glow effects to your profile
- **Animations**: Enable smooth hover animations and transitions

### Profile Effects
- **Custom Effects**: Add animated overlays (like Nitro profile effects)
- **Intro + Loop**: Support for two-part effects (intro plays once, then loops)
- **Duration Control**: Set how long the intro plays before switching to loop

### Nameplate Customization
- **Gradient Background**: Add colored gradients behind your name in member lists and DMs
- **Video Background**: Use animated video backgrounds (.webm) in nameplates
- **Poster Image**: Set a static fallback image for video nameplates

### Display Name Styling
- **Custom Fonts**: Choose from 8 different font styles:
  - gg sans (Default)
  - Tempo
  - Sakura
  - Jellybean
  - Modern
  - Medieval
  - 8Bit
  - Vampyre
- **Text Effects**: Apply visual effects to your display name:
  - Solid
  - Gradient
  - Neon
  - Toon
  - Pop
- **Custom Colors**: Set main color and gradient end color

## Preview

<div align="center">
  <img width="350" alt="Profile popup" src="https://github.com/user-attachments/assets/54b64682-1a30-438f-a373-0022fd0f31df" />
  <img width="500" alt="Full screen profile" src="https://github.com/user-attachments/assets/f42a104c-159d-4dd1-82d7-a170c61bc0fb" />
</div>

## Setup

1. **Get Your User ID**
   - Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
   - Right-click your profile and select "Copy User ID"
   - Paste it in the plugin settings

2. **Configure Your Profile**
   - Open Vencord settings
   - Navigate to the Nitro Profile Customizer plugin
   - Fill in the customization options you want to use

3. **View Your Profile**
   - Open your profile (click your avatar in any server member list)
   - Your customizations will be applied automatically

## Settings Guide

### Basic Settings
- **userId**: Your Discord User ID (required for the plugin to work)
- **enableCustomization**: Master toggle for all customizations

### Banner Settings
- **customBanner**: Direct URL to an image (takes priority over color)
- **customBannerColor**: Hex color code (e.g., `#5865f2`)

### Avatar Settings
- **customAvatar**: Direct URL to replace your avatar
- **customAvatarDecoration**: Direct URL for avatar decoration overlay

### Text Customization
- **customDisplayName**: Override your display name
- **customBio**: Custom bio/about me text
- **customStatus**: Custom status message

### Theme Settings
- **enableProfileTheme**: Toggle custom theme colors
- **primaryColor**: Primary gradient color (hex code)
- **secondaryColor**: Secondary gradient color (hex code)
- **backgroundOpacity**: Theme background transparency (0-100)

### Profile Effects
- **enableProfileEffect**: Toggle animated profile effects
- **profileEffectUrl**: URL to intro effect image/gif
- **profileEffectLoopUrl**: URL to loop effect image/gif (optional)
- **profileEffectIntroDuration**: How long intro plays before switching to loop (seconds)

### Visual Enhancements
- **enableGlow**: Add Nitro-like glow effects
- **enableAnimations**: Enable smooth transitions and hover effects

### Nameplate Settings
- **enableNameplate**: Toggle custom nameplate backgrounds
- **nameplateColor**: Gradient color for nameplate (hex code)
- **nameplateVideo**: Video URL for animated nameplate (.webm)
- **nameplatePoster**: Static poster image URL (.png)

### Display Name Styling
- **enableDisplayNameStyle**: Toggle custom display name styling
- **displayNameFont**: Choose from 8 font styles
- **displayNameEffect**: Choose visual effect (solid, gradient, neon, toon, pop)
- **displayNameColor**: Main text color (hex code)
- **displayNameGradientEnd**: End color for gradient effect (hex code)

## Tips

- **Image URLs**: Use direct links to images (ending in .png, .jpg, .gif, etc.)
- **Hex Colors**: Always start with `#` (e.g., `#ff0000` for red)
- **Profile Effects**: Use transparent PNGs or GIFs for best results
- **Nameplate Videos**: Use .webm format for best compatibility
- **Testing**: Open and close your profile to see changes take effect

## Limitations

- Customizations are **local only** - other users see your normal profile
- Requires your User ID to be set correctly
- Some Discord UI updates may temporarily break styling (will auto-fix)
- Video nameplates work best with .webm format

## Troubleshooting

**Customizations not showing?**
- Make sure you've entered your correct User ID
- Check that `enableCustomization` is turned on
- Try closing and reopening your profile

**Colors not working?**
- Ensure hex codes start with `#`
- Use 6-digit hex codes (e.g., `#ff0000`, not `#f00`)

**Images not loading?**
- Use direct image URLs (not webpage links)
- Make sure URLs are publicly accessible
- Check that URLs end with image extensions (.png, .jpg, .gif)

**Profile effect not appearing?**
- Enable `enableProfileEffect` in settings
- Provide a valid `profileEffectUrl`
- Use transparent images for best results

## Examples

### Cyberpunk Theme
```
primaryColor: #ff00ff
secondaryColor: #00ffff
enableGlow: true
enableAnimations: true
```

### Nature Theme
```
customBanner: https://example.com/forest.jpg
primaryColor: #2d5016
secondaryColor: #1a3409
backgroundOpacity: 85
```

### Neon Display Name
```
enableDisplayNameStyle: true
displayNameEffect: neon
displayNameColor: #00ffff
displayNameFont: pixelify
```

## Credits

Created for Vencord by [me](https://github.com/JMJAJ)
