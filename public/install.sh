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
DOWNLOAD_URL="https://github.com/jano-editor/jano/releases/latest/download/${BINARY}"
INSTALL_DIR="$HOME/.local/bin"

echo -e "  Platform: ${BOLD}${OS}-${ARCH}${RESET}"
echo ""

# Check if curl or wget is available
if command -v curl &> /dev/null; then
  DOWNLOAD_CMD="curl -fSL --progress-bar -o"
elif command -v wget &> /dev/null; then
  DOWNLOAD_CMD="wget -q --show-progress -O"
else
  echo -e "${RED}✗ curl or wget required${RESET}"
  exit 1
fi

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
    echo "    echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ${RC_FILE}"
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
