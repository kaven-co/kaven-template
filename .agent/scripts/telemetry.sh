#!/usr/bin/env bash
# .agent/scripts/telemetry.sh
# KAVEN AGENT CORE - Telemetry System
# Version: 1.0.0
# Purpose: Emit telemetry events for tracking

set -euo pipefail

# ==============================================================================
# CONFIGURATION
# ==============================================================================

TELEMETRY_LOG="${KAVEN_TELEMETRY_LOG:-$HOME/.kaven/telemetry.log}"
TELEMETRY_ENABLED="${KAVEN_TELEMETRY:-1}"

# Create telemetry directory if it doesn't exist
mkdir -p "$(dirname "$TELEMETRY_LOG")"

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

# Generate UUID (cross-platform)
generate_uuid() {
    if command -v uuidgen &> /dev/null; then
        uuidgen
    elif [[ -f /proc/sys/kernel/random/uuid ]]; then
        cat /proc/sys/kernel/random/uuid
    else
        # Fallback: timestamp + random number
        echo "$(date +%s)-$$-$RANDOM"
    fi
}

# Get session ID (or create new one)
get_session_id() {
    SESSION_FILE="$HOME/.kaven/session_id"
    
    if [[ -f "$SESSION_FILE" ]]; then
        cat "$SESSION_FILE"
    else
        NEW_SESSION=$(generate_uuid)
        echo "$NEW_SESSION" > "$SESSION_FILE"
        echo "$NEW_SESSION"
    fi
}

# Hash identifier for privacy (SHA-256)
hash_identifier() {
    local id=$1
    local salt="${KAVEN_TELEMETRY_SALT:-kaven-default-salt}"
    
    if command -v sha256sum &> /dev/null; then
        echo -n "${id}${salt}" | sha256sum | awk '{print $1}'
    elif command -v shasum &> /dev/null; then
        echo -n "${id}${salt}" | shasum -a 256 | awk '{print $1}'
    else
        # Fallback: just return the ID (not ideal but works)
        echo "$id"
    fi
}

# ==============================================================================
# EMIT EVENT FUNCTION
# ==============================================================================

emit_event() {
    # Check if telemetry is disabled
    if [[ "$TELEMETRY_ENABLED" == "0" ]]; then
        return 0
    fi
    
    # Parse arguments
    local event_type=$1
    local success=${2:-true}
    local duration=${3:-0}
    local metadata=${4:-"{}"}
    
    # Generate event ID
    local event_id=$(generate_uuid)
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local session_id=$(get_session_id)
    
    # Get context
    local repo_name=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
    local git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    
    # Get environment
    local environment=${NODE_ENV:-development}
    local platform=$(uname -s)
    local node_version=$(node --version 2>/dev/null || echo "unknown")
    local cli_version=$(cat package.json 2>/dev/null | grep -oP '"version":\s*"\K[^"]+' || echo "unknown")
    
    # Get user info (hashed for privacy)
    local user_id=""
    local git_email=$(git config user.email 2>/dev/null || echo "")
    if [[ -n "$git_email" ]]; then
        user_id=$(hash_identifier "$git_email")
    fi
    
    # Build JSON event
    local event_json=$(cat <<EOF
{
  "id": "$event_id",
  "timestamp": "$timestamp",
  "category": "$(echo "$event_type" | cut -d. -f1)",
  "type": "$event_type",
  "sessionId": "$session_id",
  "userId": "$user_id",
  "repo": "$repo_name",
  "branch": "$git_branch",
  "commit": "$git_commit",
  "environment": "$environment",
  "platform": "$platform",
  "nodeVersion": "$node_version",
  "cliVersion": "$cli_version",
  "success": $success,
  "duration": $duration,
  "metadata": $metadata
}
EOF
)
    
    # Append to log file
    echo "$event_json" >> "$TELEMETRY_LOG"
}

# ==============================================================================
# CONVENIENCE FUNCTIONS FOR COMMON EVENTS
# ==============================================================================

emit_cli_command_start() {
    local command=$1
    emit_event "cli.command.start" "true" "0" "{\"command\": \"$command\"}"
}

emit_cli_command_end() {
    local command=$1
    local success=$2
    local duration=$3
    emit_event "cli.command.end" "$success" "$duration" "{\"command\": \"$command\"}"
}

emit_quality_gate() {
    local gate=$1  # lint, typecheck, test
    local success=$2
    local duration=$3
    local errors=${4:-0}
    
    emit_event "quality.$gate.end" "$success" "$duration" "{\"errorsFound\": $errors}"
}

emit_git_operation() {
    local operation=$1  # commit, push, pr
    local success=$2
    local duration=$3
    
    emit_event "git.$operation.end" "$success" "$duration" "{}"
}

# ==============================================================================
# MAIN FUNCTION (for testing)
# ==============================================================================

if [[ "${BASH_SOURCE[0]:-$0}" == "${0}" ]]; then
    # Script is being run directly (not sourced)
    
    if [[ $# -eq 0 ]]; then
        echo "Usage: $0 <event_type> [success] [duration] [metadata]"
        echo ""
        echo "Examples:"
        echo "  $0 cli.command.start true 0 '{\"command\": \"init\"}'"
        echo "  $0 quality.lint.end true 1500 '{\"errorsFound\": 0}'"
        echo ""
        echo "Convenience functions (when sourced):"
        echo "  emit_cli_command_start <command>"
        echo "  emit_cli_command_end <command> <success> <duration>"
        echo "  emit_quality_gate <gate> <success> <duration> [errors]"
        echo "  emit_git_operation <operation> <success> <duration>"
        exit 1
    fi
    
    emit_event "$@"
    echo "✅ Event emitted to $TELEMETRY_LOG"
fi
