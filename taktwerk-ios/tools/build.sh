#!/bin/sh
# Baut Taktwerk für den iPad-Simulator und zeigt nur Fehler, Warnungen und das Ergebnis.
# Aufruf: tools/build.sh [Simulator-ID]
cd "$(dirname "$0")/.." || exit 1
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
DEST="${1:-A9BC7D4E-E838-41DB-8FC2-8918ACC1BAFA}"
xcodebuild -project Taktwerk.xcodeproj -scheme Taktwerk -destination "platform=iOS Simulator,id=$DEST" \
  -derivedDataPath build/DD build 2>&1 | grep -E ": (error|warning):|\*\* BUILD" | sort -u
echo "App: build/DD/Build/Products/Debug-iphonesimulator/Taktwerk.app"
