#!/bin/bash

# Script: build-ios-release.sh
# Purpose: Сборка iOS релизной версии для TestFlight/App Store
# Usage: ./scripts/build-ios-release.sh

set -e

echo "🍎 Starting iOS Release Build..."
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE="ios/SudokuGame.xcworkspace"
SCHEME="SudokuGame"
CONFIGURATION="Release"
ARCHIVE_PATH="ios/build/SudokuGame.xcarchive"
EXPORT_PATH="ios/build"
EXPORT_OPTIONS="ios/ExportOptions.plist"

# Step 1: Clean previous builds
echo -e "${YELLOW}[1/6] Cleaning previous builds...${NC}"
if [ -d "ios/build" ]; then
    rm -rf ios/build
fi
mkdir -p ios/build

# Step 2: Install dependencies
echo -e "${YELLOW}[2/6] Installing CocoaPods dependencies...${NC}"
cd ios
pod install --repo-update
cd ..

# Step 3: Clean Xcode build
echo -e "${YELLOW}[3/6] Cleaning Xcode build cache...${NC}"
xcodebuild clean \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION"

# Step 4: Archive
echo -e "${YELLOW}[4/6] Creating archive...${NC}"
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination 'generic/platform=iOS' \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic

# Check if archive was created successfully
if [ ! -d "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Archive creation failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archive created successfully at: $ARCHIVE_PATH${NC}"

# Step 5: Export IPA
echo -e "${YELLOW}[5/6] Exporting IPA for App Store...${NC}"

# Check if ExportOptions.plist exists
if [ ! -f "$EXPORT_OPTIONS" ]; then
    echo -e "${RED}❌ ExportOptions.plist not found!${NC}"
    echo "Please create $EXPORT_OPTIONS with your team ID and provisioning profile settings."
    exit 1
fi

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -allowProvisioningUpdates

# Check if IPA was exported successfully
if [ ! -f "$EXPORT_PATH/SudokuGame.ipa" ]; then
    echo -e "${RED}❌ IPA export failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ IPA exported successfully!${NC}"

# Step 6: Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ iOS Release Build Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📦 Archive: $ARCHIVE_PATH"
echo "📲 IPA: $EXPORT_PATH/SudokuGame.ipa"
echo ""
echo "Next steps:"
echo "1. Upload to App Store Connect using Transporter or:"
echo "   xcrun altool --upload-app --type ios --file '$EXPORT_PATH/SudokuGame.ipa' --username 'your@email.com' --password 'app-specific-password'"
echo ""
echo "2. Or use Xcode → Window → Organizer → Archives → Upload to App Store"
echo ""
