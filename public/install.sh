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

# check node
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  echo -e "${GREEN}✓${RESET} Node.js v$(node -v | sed 's/v//') found"

  if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${YELLOW}⚠ Node.js >= 22 required, you have v$(node -v | sed 's/v//')${RESET}"
    echo ""
    read -p "Install Node.js 22? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Installing Node.js 22..."
      if command -v curl &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
      else
        echo -e "${RED}✗ curl not found. Please install Node.js 22 manually: https://nodejs.org${RESET}"
        exit 1
      fi
    else
      echo -e "${RED}✗ Node.js >= 22 required${RESET}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}⚠ Node.js not found${RESET}"
  echo ""
  read -p "Install Node.js 22? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing Node.js 22..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      if command -v brew &> /dev/null; then
        brew install node@22
      else
        echo -e "${RED}✗ Homebrew not found. Please install Node.js 22 manually: https://nodejs.org${RESET}"
        exit 1
      fi
    else
      if command -v curl &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
      else
        echo -e "${RED}✗ curl not found. Please install Node.js 22 manually: https://nodejs.org${RESET}"
        exit 1
      fi
    fi
  else
    echo -e "${RED}✗ Node.js required${RESET}"
    exit 1
  fi
fi

# install jano
echo ""
echo "Installing jano editor..."
sudo npm install -g @jano-editor/editor@latest

# verify
if command -v jano &> /dev/null; then
  echo ""
  echo -e "${GREEN}✓ jano installed successfully!${RESET}"
  echo ""
  echo "  Usage:"
  echo "    jano                   Open new file"
  echo "    jano file.txt          Open file"
  echo "    jano plugin search     Browse plugins"
  echo "    jano plugin install    Install a plugin"
  echo ""
else
  echo -e "${RED}✗ Installation failed. Try: sudo npm install -g @jano-editor/editor${RESET}"
  exit 1
fi
