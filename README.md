# Maglor

dmenu integration for bw-cli

# Requirements

- node.js
- npm
- make
- bitwarden cli
- dmenu
- xclip

# Installation

```Bash
make build
```

```Bash
sudo make install
```

# Usage

Run the local bitwarden service. You must be logged in with the bitwarden cli.

```Bash
bw serve --port 8080
```

Hack to start service in the background (add to shell profile):

```Bash
if [ $(netstat -ltnp 2>/dev/null | grep '8080.*LISTEN.*node' | wc -l) -lt 1 ]; then
    setsid bw serve --port 8080 &
fi
```

run

```Bash
maglor
```

