#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x "${SCRIPT_DIR}/android/gradlew"
exec "${SCRIPT_DIR}/android/gradlew" -p "${SCRIPT_DIR}/android" "$@"
