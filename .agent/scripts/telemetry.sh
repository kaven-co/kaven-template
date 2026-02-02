#!/usr/bin/env bash
# .agent/scripts/telemetry.sh
# Agent Core - Telemetry System
# Version: 1.0.0
# Purpose: Emit telemetry events with per-project isolation

set -euo pipefail

# ==============================================================================
# CONFIGURATION (Per-Project Isolation)
# ==============================================================================

# Get project name from current directory or git root
get_project_name() {
    local project_dir
    project_dir=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    basename "$project_dir"
}

# Initialize telemetry directory (lazy init - no bootstrap required)
init_telemetry_dir() {
    local project_name
    project_name=$(get_project_name)
    local telemetry_dir="$HOME/.agent-core/$project_name"
    
    if [[ ! -d "$telemetry_dir" ]]; then
        mkdir -p "$telemetry_dir"
    fi
    
    echo "$telemetry_dir"
}

# Get telemetry log path
TELEMETRY_DIR=$(init_telemetry_dir)
TELEMETRY_LOG="${AGENT_CORE_TELEMETRY_LOG:-$TELEMETRY_DIR/telemetry.log}"
TELEMETRY_ENABLED="${AGENT_CORE_TELEMETRY:-1}"

# Ensure log file exists
touch "$TELEMETRY_LOG"

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

# Get session ID (or create new one) - per project
get_session_id() {
    local session_file="$TELEMETRY_DIR/session_id"
    
    if [[ -f "$session_file" ]]; then
        cat "$session_file"
    else
        local new_session
        new_session=$(generate_uuid)
        echo "$new_session" > "$session_file"
        echo "$new_session"
    fi
}

# Hash identifier for privacy (SHA-256)
hash_identifier() {
    local id=$1
    local salt="${AGENT_CORE_TELEMETRY_SALT:-agent-core-default-salt}"
    
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
    local event_id
    event_id=$(generate_uuid)
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local session_id
    session_id=$(get_session_id)
    
    # Get context
    local project_name
    project_name=$(get_project_name)
    local git_branch
    git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local git_commit
    git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    
    # Get environment
    local environment=${NODE_ENV:-development}
    local platform
    platform=$(uname -s)
    local node_version
    node_version=$(node --version 2>/dev/null || echo "unknown")
    
    # Get user info (hashed for privacy)
    local user_id=""
    local git_email
    git_email=$(git config user.email 2>/dev/null || echo "")
    if [[ -n "$git_email" ]]; then
        user_id=$(hash_identifier "$git_email")
    fi
    
    # Build JSON event
    local event_json
    event_json=$(cat <<EOF
{
  "id": "$event_id",
  "timestamp": "$timestamp",
  "category": "$(echo "$event_type" | cut -d. -f1)",
  "type": "$event_type",
  "sessionId": "$session_id",
  "userId": "$user_id",
  "project": "$project_name",
  "branch": "$git_branch",
  "commit": "$git_commit",
  "environment": "$environment",
  "platform": "$platform",
  "nodeVersion": "$node_version",
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

emit_workflow_start() {
    local workflow=$1
    emit_event "workflow.start" "true" "0" "{\"workflow\": \"$workflow\"}"
}

emit_workflow_end() {
    local workflow=$1
    local success=$2
    local duration=$3
    emit_event "workflow.end" "$success" "$duration" "{\"workflow\": \"$workflow\"}"
}

emit_evidence_bundle() {
    local bundle_id=$1
    local files_changed=$2
    emit_event "evidence.bundle" "true" "0" "{\"bundleId\": \"$bundle_id\", \"filesChanged\": $files_changed}"
}

# ==============================================================================
# MAIN FUNCTION (for testing and direct usage)
# ==============================================================================

if [[ "${BASH_SOURCE[0]:-$0}" == "${0}" ]]; then
    # Script is being run directly (not sourced)
    
    if [[ $# -eq 0 ]]; then
        echo "Agent Core Telemetry v1.0.0"
        echo ""
        echo "Usage: $0 <event_type> [success] [duration] [metadata]"
        echo ""
        echo "Telemetry location: $TELEMETRY_LOG"
        echo "Project: $(get_project_name)"
        echo ""
        echo "Examples:"
        echo "  $0 cli.command.start true 0 '{\"command\": \"init\"}'"
        echo "  $0 quality.lint.end true 1500 '{\"errorsFound\": 0}'"
        echo ""
        echo "Disable telemetry:"
        echo "  export AGENT_CORE_TELEMETRY=0"
        exit 0
    fi
    
    emit_event "$@"
    echo "✅ Event emitted to $TELEMETRY_LOG"
fi
