Add an application icon to this React Native + TypeScript project using the provided image.

Source image:

Icon file: drop_blood.jpg

Path: @assets/images/drop_blood.jpg

Requirements:

Generate and configure app icons for both Android and iOS

Use the image as the base icon, properly resized and optimized

Ensure the icon is square, centered, and visually balanced

Do not stretch or distort the image

Android-specific tasks:

Generate all required launcher icon sizes (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

Place icons inside the correct android/app/src/main/res/mipmap-\* directories

Update AndroidManifest.xml to reference the new launcher icon

Ensure compatibility with modern Android versions

iOS-specific tasks:

Generate all required icon sizes for iPhone and iPad

Place icons inside ios/<project-name>/Images.xcassets/AppIcon.appiconset

Properly update Contents.json

Ensure icons meet Apple App Store requirements

Technical constraints:

React Native project (not Expo unless explicitly detected)

No third-party paid tools

Prefer CLI-based or manual setup if needed

Output expectation:

Step-by-step instructions

File paths and folder structure

Any commands required to generate or apply icons

Notes on clearing cache or rebuilding the app to see changes

Verification:

App icon should appear correctly on the device home screen

Icon should display properly in both light and dark modes

Assume the project is already running correctly and focus only on app icon integration.

💡 Optional Add-Ons (only if you want)

You can append one of these depending on your goal:

If you want automation:

Prefer using react-native-make or @bam.tech/react-native-make if appropriate.

If you want no libraries at all:

Do everything manually without using icon generator libraries.
