#!/usr/bin/env bash
# ==============================================================================
# Brain Battle Appium E2E Automation - CI Execution Script
# ==============================================================================

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}" || exit 1

echo "=============================================================================="
echo "🚀 Starting Brain Battle Mobile Appium E2E CI Pipeline"
echo "Project Directory: ${PROJECT_DIR}"
echo "Current Time: $(date -u)"
echo "=============================================================================="

# 5. Dynamically read $GITHUB_PATH and add its entries to $PATH
if [ -n "${GITHUB_PATH}" ] && [ -f "${GITHUB_PATH}" ]; then
  echo "📥 Injecting GITHUB_PATH entries into PATH..."
  while IFS= read -r line || [ -n "$line" ]; do
    if [ -n "$line" ] && [ -d "$line" ]; then
      export PATH="$line:$PATH"
      echo "  Added: $line"
    fi
  done < "${GITHUB_PATH}"
fi

echo "Active PATH: $PATH"

# 1 & 2. Read ${APK_PATH} and install APK using adb
echo "------------------------------------------------------------------------------"
echo "📱 Checking Android Device and Installing APK..."
echo "------------------------------------------------------------------------------"

adb devices -l

if [ -n "${APK_PATH}" ] && [ -f "${APK_PATH}" ]; then
  echo "Found APK at: ${APK_PATH}"
  echo "Installing APK with adb install -r \"${APK_PATH}\"..."
  if adb install -r "${APK_PATH}"; then
    echo "✅ APK installed successfully."
  else
    echo "⚠️ Warning: adb install returned non-zero exit code. Continuing test run..."
  fi
else
  echo "ℹ️ Note: APK_PATH ('${APK_PATH}') not found or not specified. Skipping direct APK install."
fi

# 3. Start Appium on port 4723
echo "------------------------------------------------------------------------------"
echo "⚙️ Starting Appium Server..."
echo "------------------------------------------------------------------------------"

APPIUM_LOG="/tmp/appium.log"
mkdir -p "$(dirname "$APPIUM_LOG")"
touch "$APPIUM_LOG"

if command -v appium > /dev/null 2>&1; then
  APPIUM_BIN="appium"
elif [ -f "/usr/local/bin/appium" ]; then
  APPIUM_BIN="/usr/local/bin/appium"
else
  APPIUM_BIN="npx appium"
fi

$APPIUM_BIN --base-path / --log-level warn > "$APPIUM_LOG" 2>&1 &
APPIUM_PID=$!
echo "Appium server process spawned using ${APPIUM_BIN} (PID: ${APPIUM_PID}). Logs: ${APPIUM_LOG}"

# 4. Wait for Appium readiness on port 4723 using curl
echo "Waiting for Appium server to become ready on http://127.0.0.1:4723/status..."
MAX_RETRIES=30
RETRY_COUNT=0
APPIUM_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s -f http://127.0.0.1:4723/status > /dev/null 2>&1; then
    APPIUM_READY=true
    echo "✅ Appium server is responding and ready on port 4723."
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Waiting for Appium... (attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 1
done

if [ "$APPIUM_READY" = false ]; then
  echo "❌ Error: Appium server failed to respond within ${MAX_RETRIES} seconds."
  echo "--- Appium Log Output ---"
  cat "$APPIUM_LOG" || true
  echo "-------------------------"
  node utils/generateFallbackReport.js "Appium server failed to start or become ready on port 4723"
  exit 1
fi

# 6. Execute WDIO test suite using Node
echo "------------------------------------------------------------------------------"
echo "🧪 Executing 1,111 Mega Test Suite via WebDriverIO..."
echo "------------------------------------------------------------------------------"

WDIO_BIN="node_modules/@wdio/cli/bin/wdio.js"

if [ ! -f "$WDIO_BIN" ]; then
  echo "Local @wdio/cli not found in node_modules, falling back to npx wdio..."
  WDIO_CMD="npx wdio run wdio.conf.js"
else
  WDIO_CMD="node ${WDIO_BIN} run wdio.conf.js"
fi

echo "Running command: ${WDIO_CMD}"
$WDIO_CMD
WDIO_EXIT_CODE=$?

echo "WDIO process finished with exit code: ${WDIO_EXIT_CODE}"

# 7. If WDIO exits early with failure, run fallback report generator
if [ $WDIO_EXIT_CODE -ne 0 ]; then
  echo "------------------------------------------------------------------------------"
  echo "⚠️ WDIO exited with failure ($WDIO_EXIT_CODE). Checking test reports..."
  echo "------------------------------------------------------------------------------"

  if [ ! -f "reports/execution-report.xlsx" ]; then
    echo "Excel report missing. Triggering fallback report generator..."
    node utils/generateFallbackReport.js "WebDriverIO exited early with code ${WDIO_EXIT_CODE}"
  fi

  # 9. Print useful diagnostics
  echo "--- Diagnostics: Connected Devices ---"
  adb devices -l || true

  echo "--- Diagnostics: Appium Log Tail ---"
  tail -n 50 "$APPIUM_LOG" || true

  echo "--- Diagnostics: WDIO Failure Summary ---"
  echo "Exit Code: ${WDIO_EXIT_CODE}"
fi

# Cleanup Appium process
if [ -n "$APPIUM_PID" ]; then
  kill "$APPIUM_PID" > /dev/null 2>&1 || true
fi

echo "=============================================================================="
echo "🏁 CI Run Complete. Final Exit Code: ${WDIO_EXIT_CODE}"
echo "=============================================================================="

# 8. Preserve the real exit status
exit $WDIO_EXIT_CODE
