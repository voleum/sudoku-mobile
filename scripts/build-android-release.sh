#!/bin/bash

# Script: build-android-release.sh
# Purpose: Сборка Android релизной версии (APK и AAB) для Google Play
# Usage: ./scripts/build-android-release.sh [apk|aab|both]

set -e

echo "🤖 Starting Android Release Build..."
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_TYPE=${1:-both}  # apk, aab, or both (default)

# Validate build type
if [[ ! "$BUILD_TYPE" =~ ^(apk|aab|both)$ ]]; then
    echo -e "${RED}❌ Invalid build type: $BUILD_TYPE${NC}"
    echo "Usage: $0 [apk|aab|both]"
    exit 1
fi

echo -e "${BLUE}Build type: $BUILD_TYPE${NC}"
echo ""

# Check if gradle.properties has release signing config
if ! grep -q "SUDOKU_RELEASE_STORE_FILE" android/gradle.properties 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Release keystore not configured!${NC}"
    echo ""
    echo "To configure release signing:"
    echo "1. Generate keystore:"
    echo "   cd android/app"
    echo "   keytool -genkeypair -v -storetype PKCS12 -keystore sudoku-release.keystore \\"
    echo "     -alias sudoku-key-alias -keyalg RSA -keysize 2048 -validity 10000"
    echo ""
    echo "2. Copy gradle.properties.example to gradle.properties:"
    echo "   cp android/gradle.properties.example android/gradle.properties"
    echo ""
    echo "3. Edit android/gradle.properties with your keystore passwords"
    echo ""
    echo "Using debug signing for now..."
    echo ""
fi

# Step 1: Clean previous builds
echo -e "${YELLOW}[1/5] Cleaning previous builds...${NC}"
cd android
./gradlew clean
cd ..

# Step 2: Run tests (optional but recommended)
echo -e "${YELLOW}[2/5] Running tests...${NC}"
npm test -- --passWithNoTests || {
    echo -e "${YELLOW}⚠️  Some tests failed, but continuing build...${NC}"
}

# Step 3: Build APK (if requested)
if [[ "$BUILD_TYPE" == "apk" || "$BUILD_TYPE" == "both" ]]; then
    echo ""
    echo -e "${YELLOW}[3/5] Building Release APK...${NC}"
    cd android
    ./gradlew assembleRelease
    cd ..

    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo -e "${GREEN}✅ APK built successfully!${NC}"
        echo "   Path: $APK_PATH"
        echo "   Size: $APK_SIZE"
    else
        echo -e "${RED}❌ APK build failed!${NC}"
        exit 1
    fi
fi

# Step 4: Build AAB (if requested)
if [[ "$BUILD_TYPE" == "aab" || "$BUILD_TYPE" == "both" ]]; then
    echo ""
    echo -e "${YELLOW}[4/5] Building Release AAB (Android App Bundle)...${NC}"
    cd android
    ./gradlew bundleRelease
    cd ..

    AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
    if [ -f "$AAB_PATH" ]; then
        AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
        echo -e "${GREEN}✅ AAB built successfully!${NC}"
        echo "   Path: $AAB_PATH"
        echo "   Size: $AAB_SIZE"
    else
        echo -e "${RED}❌ AAB build failed!${NC}"
        exit 1
    fi
fi

# Step 5: Summary
echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✅ Android Release Build Complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

if [[ "$BUILD_TYPE" == "apk" || "$BUILD_TYPE" == "both" ]]; then
    echo "📦 APK: $APK_PATH"
    echo "   Use for: Direct installation, testing on devices"
    echo "   Install: adb install $APK_PATH"
    echo ""
fi

if [[ "$BUILD_TYPE" == "aab" || "$BUILD_TYPE" == "both" ]]; then
    echo "📲 AAB: $AAB_PATH"
    echo "   Use for: Google Play Console upload"
    echo "   Upload: https://play.google.com/console"
    echo ""
fi

echo "Next steps:"
echo ""

if [[ "$BUILD_TYPE" == "apk" || "$BUILD_TYPE" == "both" ]]; then
    echo "For APK testing:"
    echo "1. Connect Android device via USB"
    echo "2. Enable USB debugging on device"
    echo "3. Run: adb install -r $APK_PATH"
    echo ""
fi

if [[ "$BUILD_TYPE" == "aab" || "$BUILD_TYPE" == "both" ]]; then
    echo "For Google Play Console:"
    echo "1. Open Google Play Console: https://play.google.com/console"
    echo "2. Select your app"
    echo "3. Testing → Internal testing → Create new release"
    echo "4. Upload $AAB_PATH"
    echo "5. Add release notes and save"
    echo ""
fi

echo -e "${BLUE}Build completed at: $(date)${NC}"
