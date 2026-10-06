#!/bin/bash
set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

PURPLE="\033[35m"
echo ""
echo -e "${PURPLE}██╗       ██╗${RESET}"
echo -e "${PURPLE}╚██╗      ██║${RESET}"
echo -e "${PURPLE} ╚██╗     ██║${RESET}"
echo -e "${PURPLE} ██╔╝██   ██║${RESET}"
echo -e "${PURPLE}██╔╝ ╚█████╔╝███████╗${RESET}"
echo -e "${PURPLE}╚═╝   ╚════╝ ╚══════╝${RESET}"
echo ""
echo -e "${BOLD}jano editor installer${RESET}"
echo ""

# Detect OS
case "$(uname -s)" in
  Linux*)  OS="linux" ;;
  Darwin*) OS="darwin" ;;
  *)
    echo -e "${RED}✗ Unsupported operating system: $(uname -s)${RESET}"
    echo "  Please visit https://github.com/jano-editor/jano/releases for manual installation."
    exit 1
    ;;
esac

# Detect architecture
case "$(uname -m)" in
  x86_64|amd64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *)
    echo -e "${RED}✗ Unsupported architecture: $(uname -m)${RESET}"
    echo "  Please visit https://github.com/jano-editor/jano/releases for manual installation."
    exit 1
    ;;
esac

BINARY="jano-${OS}-${ARCH}"
INSTALL_DIR="${JANO_INSTALL_DIR:-$HOME/.local/bin}"
RELEASES="https://github.com/jano-editor/jano/releases"
API_URL="https://api.github.com/repos/jano-editor/jano/releases?per_page=100"

echo -e "  Platform: ${BOLD}${OS}-${ARCH}${RESET}"

# Check if curl or wget is available
if command -v curl &> /dev/null; then
  DOWNLOAD_CMD="curl -fSL --progress-bar -o"
  FETCH_CMD="curl -fsSL --max-time 15"
elif command -v wget &> /dev/null; then
  DOWNLOAD_CMD="wget -q --show-progress -O"
  FETCH_CMD="wget -qO- --timeout=15"
else
  echo -e "${RED}✗ curl or wget required${RESET}"
  exit 1
fi

# Find the newest editor release. ui and plugin-types releases live in the same repo,
# so "releases/latest" may point to a release without binaries.
if [ -n "$JANO_VERSION" ]; then
  TAG="editor-v${JANO_VERSION#v}"
else
  TAG=$($FETCH_CMD "$API_URL" 2>/dev/null \
    | grep -o '"tag_name": *"editor-v[^"]*"' \
    | head -n 1 \
    | sed 's/.*"\(editor-v[^"]*\)"/\1/' || true)
fi

if [ -n "$TAG" ]; then
  DOWNLOAD_URL="${RELEASES}/download/${TAG}/${BINARY}"
  echo -e "  Version:  ${BOLD}${TAG#editor-v}${RESET}"
else
  echo -e "${YELLOW}⚠ Could not reach the GitHub API, falling back to the latest release${RESET}"
  DOWNLOAD_URL="${RELEASES}/latest/download/${BINARY}"
fi
echo ""

# Download binary
echo "Downloading jano..."
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

if ! $DOWNLOAD_CMD "$TMPFILE" "$DOWNLOAD_URL"; then
  echo ""
  echo -e "${RED}✗ Download failed${RESET}"
  echo "  No binary available for ${OS}-${ARCH}."
  echo "  Please visit https://github.com/jano-editor/jano/releases"
  exit 1
fi

# Verify checksum (older releases don't publish SHA256SUMS)
if command -v sha256sum &> /dev/null; then
  HASH_CMD="sha256sum"
else
  HASH_CMD="shasum -a 256"
fi
SUMS=$($FETCH_CMD "${DOWNLOAD_URL%/*}/SHA256SUMS" 2>/dev/null || true)
EXPECTED=$(echo "$SUMS" | grep -E " \*?${BINARY}$" | cut -d' ' -f1)
if [ -n "$EXPECTED" ]; then
  ACTUAL=$($HASH_CMD "$TMPFILE" | cut -d' ' -f1)
  if [ "$ACTUAL" != "$EXPECTED" ]; then
    echo -e "${RED}✗ Checksum mismatch, the download may be corrupted. Nothing was installed.${RESET}"
    exit 1
  fi
  echo -e "${GREEN}✓ Checksum verified${RESET}"
else
  echo -e "${YELLOW}⚠ No checksum published for this release, skipping verification${RESET}"
fi

# Install
mkdir -p "$INSTALL_DIR"
mv "$TMPFILE" "$INSTALL_DIR/jano"
chmod +x "$INSTALL_DIR/jano"

# Verify
if "$INSTALL_DIR/jano" --version &> /dev/null; then
  echo ""
  echo -e "${GREEN}✓ jano installed to ${INSTALL_DIR}/jano${RESET}"
else
  echo ""
  echo -e "${RED}✗ Installation failed - binary may be incompatible with your system${RESET}"
  rm -f "$INSTALL_DIR/jano"
  exit 1
fi

# Check if install dir is in PATH
if ! echo "$PATH" | tr ':' '\n' | grep -qx "$INSTALL_DIR"; then
  echo ""
  echo -e "${YELLOW}⚠ ${INSTALL_DIR} is not in your PATH${RESET}"
  echo ""
  SHELL_NAME=$(basename "$SHELL")
  case "$SHELL_NAME" in
    zsh)  RC_FILE="~/.zshrc" ;;
    bash) RC_FILE="~/.bashrc" ;;
    fish) RC_FILE="~/.config/fish/config.fish" ;;
    *)    RC_FILE="your shell config" ;;
  esac
  echo "  Add it by running:"
  if [ "$SHELL_NAME" = "fish" ]; then
    echo "    fish_add_path $INSTALL_DIR"
  else
    echo "    echo 'export PATH=\"${INSTALL_DIR}:\$PATH\"' >> ${RC_FILE}"
  fi
  echo ""
  echo "  Then restart your terminal or run:"
  echo "    source ${RC_FILE}"
fi

echo ""
echo "  Usage:"
echo "    jano                   Open new file"
echo "    jano file.txt          Open file"
echo "    jano plugin search     Browse plugins"
echo "    jano plugin install    Install a plugin"
echo ""
