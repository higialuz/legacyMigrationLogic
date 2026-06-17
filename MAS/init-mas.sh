#!/usr/bin/env bash
# MAS — MAR Agent Scaffold
# Usage: bash /path/to/MAS/init-mas.sh "My Project Name"
# Drops the agent/MAR/docs scaffold into the current directory.

set -e

PROJECT_NAME="${1:-My Project}"
DATE=$(date +%Y-%m-%d)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 MAS — initializing agent scaffold for: $PROJECT_NAME"

copy_template() {
  local src="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
      -e "s/{{DATE}}/$DATE/g" \
      "$src" > "$dest"
  echo "  ✅ $dest"
}

copy_template "$SCRIPT_DIR/AGENTS.md"                    "./AGENTS.md"
copy_template "$SCRIPT_DIR/PHASES.md"                    "./PHASES.md"
copy_template "$SCRIPT_DIR/TODO.md"                      "./TODO.md"
copy_template "$SCRIPT_DIR/DONE.md"                      "./DONE.md"
copy_template "$SCRIPT_DIR/mar-analysis/MAR-PROTOCOL.md" "./mar-analysis/MAR-PROTOCOL.md"
copy_template "$SCRIPT_DIR/mar-analysis/DEVRULES.md"     "./mar-analysis/DEVRULES.md"
copy_template "$SCRIPT_DIR/mar-analysis/TEMPLATE.md"     "./mar-analysis/TEMPLATE.md"

# Enforce .gitignore rule — only README.md is committed
GITIGNORE="./.gitignore"
RULE_MARKER="# MAS: block all .md except README"
if [ ! -f "$GITIGNORE" ] || ! grep -qF "$RULE_MARKER" "$GITIGNORE"; then
  printf "\n%s\n*.md\n!README.md\n" "$RULE_MARKER" >> "$GITIGNORE"
  echo "  ✅ .gitignore — *.md rule added (only README.md committed)"
else
  echo "  ⏭  .gitignore — rule already present, skipped"
fi

echo ""
echo "✅ Done. Next steps:"
echo "   1. Edit PHASES.md — define your implementation phases"
echo "   2. Edit mar-analysis/DEVRULES.md — add project-specific rules"
echo "   3. Commit AGENTS.md + .gitignore (README.md only for .md files)"
