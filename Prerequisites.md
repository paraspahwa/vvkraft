# Prerequisites — VideoForge

This document covers everything you need to install and run VideoForge locally or on a remote server.  
Follow the section that matches your operating system, then complete the [common steps](#4-clone-the-repo--install-dependencies) at the bottom.

---

## Table of Contents

1. [Required Software Versions](#1-required-software-versions)
2. [Installation by Platform](#2-installation-by-platform)
   - [macOS](#macos)
   - [Windows](#windows)
   - [Ubuntu / Debian Linux](#ubuntu--debian-linux)
   - [RHEL / CentOS / Fedora / Amazon Linux 2023](#rhel--centos--fedora--amazon-linux-2023)
   - [Amazon EC2 (Amazon Linux 2 / Amazon Linux 2023)](#amazon-ec2)
3. [External Services & Accounts](#3-external-services--accounts)
4. [Clone the Repo & Install Dependencies](#4-clone-the-repo--install-dependencies)
5. [Environment Variables](#5-environment-variables)
6. [Running the Project](#6-running-the-project)

---

## 1. Required Software Versions

| Tool | Minimum version | Notes |
|------|----------------|-------|
| **Node.js** | **20** LTS | Use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage versions |
| **npm** | **10** | Bundled with Node 20; required for workspace support |
| **Git** | 2.x | Any recent version works |
| **Redis** | **7** | Used by the BullMQ background worker. Upstash or Redis Cloud are drop-in alternatives |
| **Xcode** *(iOS only)* | 15+ | macOS only; required to run the mobile app on an iOS simulator |
| **Android Studio** *(Android only)* | Hedgehog + | Required to run the mobile app on an Android emulator |

> **Cloud Redis alternatives:** [Upstash](https://upstash.com/) (free tier available) and [Redis Cloud](https://redis.com/redis-enterprise-cloud/) work out of the box — just set the `REDIS_URL` env var to the connection string they provide. A local Redis install is **not** required if you use one of these.

---

## 2. Installation by Platform

### macOS

#### 2.1 Install Homebrew (package manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow any instructions to add Homebrew to your PATH (especially on Apple Silicon).

#### 2.2 Install Git

```bash
brew install git
git --version
```

#### 2.3 Install Node.js via nvm (recommended)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell config
source ~/.zshrc   # or ~/.bashrc if you use bash

# Install and activate Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

#### 2.4 Install Redis

```bash
brew install redis

# Start Redis now and on login
brew services start redis

# Verify
redis-cli ping   # PONG
```

#### 2.5 (Optional) iOS development

Install Xcode from the [Mac App Store](https://apps.apple.com/app/xcode/id497799835) and accept the licence:

```bash
sudo xcodebuild -license accept
```

Install Expo CLI for the mobile app:

```bash
npm install -g expo-cli eas-cli
```

---

### Windows

#### 2.1 Install Git

Download and run the installer from <https://git-scm.com/download/win>.  
Accept all defaults; make sure **"Git Bash"** is included.

#### 2.2 Install Node.js via nvm-windows

1. Download the latest **nvm-windows** installer from <https://github.com/coreybutler/nvm-windows/releases> (`nvm-setup.exe`).
2. Run the installer and follow the prompts.
3. Open a **new** Command Prompt or PowerShell window:

```powershell
nvm install 20
nvm use 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

#### 2.3 Install Redis on Windows

**Option A – Windows Subsystem for Linux (WSL2, recommended)**

```powershell
# Enable WSL2 (run in PowerShell as Administrator, then reboot)
wsl --install

# Inside your WSL2 terminal (Ubuntu):
sudo apt-get update
sudo apt-get install -y redis-server
sudo service redis-server start
redis-cli ping   # PONG
```

**Option B – Memurai (native Windows Redis fork)**

Download from <https://www.memurai.com/> and install. Memurai is API-compatible with Redis 7 and starts as a Windows service automatically.

**Option C – Cloud Redis (no local install needed)**

Use [Upstash](https://upstash.com/) (free tier) and set `REDIS_URL` in your `.env.local`.

#### 2.4 Install Windows Build Tools (for native Node modules)

```powershell
# Run in PowerShell as Administrator
npm install -g windows-build-tools
```

#### 2.5 (Optional) Android development

Install [Android Studio](https://developer.android.com/studio) and follow the [Expo Android setup guide](https://docs.expo.dev/workflow/android-studio-emulator/).

---

### Ubuntu / Debian Linux

```bash
# Update package index
sudo apt-get update && sudo apt-get upgrade -y

# Install Git
sudo apt-get install -y git curl build-essential

git --version
```

#### 2.1 Install Node.js via nvm

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

node --version   # v20.x.x
npm --version    # 10.x.x
```

#### 2.2 Install Redis

```bash
# Install Redis 7 from the official PPA (Ubuntu 22.04+)
sudo apt-get install -y lsb-release gpg

curl -fsSL https://packages.redis.io/gpg | \
  sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] \
  https://packages.redis.io/deb $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/redis.list

sudo apt-get update
sudo apt-get install -y redis

# Enable and start the service
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify
redis-cli ping   # PONG
```

---

### RHEL / CentOS / Fedora / Amazon Linux 2023

```bash
# Install Git and build tools
sudo dnf install -y git curl gcc-c++ make

git --version
```

#### 2.1 Install Node.js via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install 20
nvm use 20
nvm alias default 20

node --version   # v20.x.x
npm --version    # 10.x.x
```

#### 2.2 Install Redis

**Fedora:**

```bash
sudo dnf install -y redis
sudo systemctl enable redis
sudo systemctl start redis
redis-cli ping   # PONG
```

**RHEL 9 / CentOS Stream 9 (use EPEL):**

```bash
sudo dnf install -y epel-release
sudo dnf install -y redis
sudo systemctl enable redis
sudo systemctl start redis
redis-cli ping   # PONG
```

---

### Amazon EC2

The steps below apply to both **Amazon Linux 2** and **Amazon Linux 2023** instances. Run everything as `ec2-user` (or your SSH user) after connecting to the instance.

#### 2.1 Connect to your EC2 instance

```bash
# From your local machine
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

#### 2.2 Update packages

```bash
sudo yum update -y     # Amazon Linux 2
# or
sudo dnf update -y     # Amazon Linux 2023
```

#### 2.3 Install Git and build tools

```bash
# Amazon Linux 2
sudo yum install -y git curl gcc-c++ make

# Amazon Linux 2023
sudo dnf install -y git curl gcc-c++ make
```

#### 2.4 Install Node.js 20 via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm without logging out
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20

node --version   # v20.x.x
npm --version    # 10.x.x
```

Add the following lines to `~/.bashrc` so nvm is loaded in future sessions:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

#### 2.5 Install Redis on EC2

> **Important:** BullMQ v5 requires **Redis 7.2 or newer**. Amazon Linux 2's `amazon-linux-extras` only provides Redis 6. For AL2 instances, use **Amazon ElastiCache for Redis 7** or [Upstash](https://upstash.com/) instead of a locally installed Redis.

**Amazon Linux 2023** (Redis 7 is available in the default repo):

```bash
sudo dnf install -y redis7
sudo systemctl enable redis7
sudo systemctl start redis7

# Verify
redis-cli ping   # PONG
redis-cli --version   # should show 7.x
```

**Amazon Linux 2** (no Redis 7 in amazon-linux-extras — use a managed service):

```bash
# Option A: Upstash (free tier, zero setup)
# Just set REDIS_URL=redis://default:<password>@<host>.upstash.io:6379 in your .env.local

# Option B: ElastiCache for Redis 7 (production-recommended)
# Create an ElastiCache cluster in the same VPC as your EC2 instance.
# Set REDIS_URL to the cluster's primary endpoint.
```

> **Tip:** For production on EC2, consider using **Amazon ElastiCache for Redis** instead of a locally installed Redis. Set `REDIS_URL` to the ElastiCache endpoint and you're done.

#### 2.6 Open security-group ports

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH |
| 3000 | TCP | 0.0.0.0/0 | Next.js web app |
| 80 | TCP | 0.0.0.0/0 | HTTP (Nginx/Caddy reverse proxy) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 6379 | TCP | Security group only | Redis (do **not** open to public) |

---

## 3. External Services & Accounts

You need accounts on the following services before the app will fully work.  
All are available on free or pay-as-you-go plans.

| Service | What it provides | Sign-up URL |
|---------|----------------|-------------|
| **Firebase** | Authentication (email/password) + Firestore database | <https://console.firebase.google.com/> |
| **Fal.ai** | AI video generation (Kling, WAN, Longcat, LTXV, Krea WAN, Pixverse, Seedance, HunyuanVideo, and 30+ more models) | <https://fal.ai/> |
| **Razorpay** | Subscription billing and one-time credit purchases | <https://razorpay.com/> |
| **Cloudflare R2** | Object storage for generated videos | <https://dash.cloudflare.com/> → R2 |

### Firebase setup

1. Create a new Firebase project.
2. Enable **Authentication** → **Email/Password** sign-in method.
3. Enable **Firestore Database** (start in test mode, then lock down rules before production).
4. Go to **Project settings** → **General** → add a **Web app** to get the client credentials.
5. Go to **Project settings** → **Service accounts** → **Generate new private key** to get the Admin SDK credentials.

### Fal.ai setup

1. Create an account at <https://fal.ai/>.
2. Go to **Dashboard** → **API Keys** → create a new key.
3. Copy the key into `FAL_KEY` in your `.env.local`.

### Razorpay setup

1. Create an account at <https://razorpay.com/>.
2. Go to **Settings** → **API Keys** → generate a key pair; copy them into `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Create subscription plans (monthly + yearly for Creator, Pro, Studio tiers) in the **Subscriptions** section.
4. Copy each plan ID into the corresponding `RAZORPAY_PLAN_*` env var.
5. Set up a webhook endpoint (`https://<your-domain>/api/webhooks/razorpay`) and copy the signing secret into `RAZORPAY_WEBHOOK_SECRET`.

### Cloudflare R2 setup

1. In the Cloudflare dashboard go to **R2** → **Create bucket**.
2. Go to **R2** → **Manage R2 API tokens** → create a token with **Object Read & Write** on the bucket.
3. Copy the Account ID, Access Key ID, and Secret Access Key into the corresponding `R2_*` env vars.
4. Enable **public access** on the bucket (or use a custom domain) and copy the public URL into `R2_PUBLIC_URL`.

---

## 4. Clone the Repo & Install Dependencies

```bash
# Clone
git clone https://github.com/paraspahwa/vvkraft.git
cd vvkraft

# Install all workspace dependencies (web + mobile + shared packages)
npm install --legacy-peer-deps
```

> **Why `--legacy-peer-deps`?** The Expo 52 / React Native 0.76 mobile packages have peer-dependency constraints that conflict with npm 10's strict resolver. The flag is safe here and does not affect the web app.

---

## 5. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/web/.env.local` and populate every variable:

```dotenv
# ── Firebase (Client SDK) ─────────────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ── Firebase Admin (Server SDK) ───────────────────────────────────────────────
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# Paste the private key exactly as it appears in the downloaded JSON, with \n for newlines
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# ── Fal.ai ────────────────────────────────────────────────────────────────────
FAL_KEY=your-fal-api-key
FAL_WEBHOOK_SECRET=your-fal-webhook-secret

# ── Razorpay ──────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
RAZORPAY_PLAN_CREATOR_MONTHLY=plan_...
RAZORPAY_PLAN_CREATOR_YEARLY=plan_...
RAZORPAY_PLAN_PRO_MONTHLY=plan_...
RAZORPAY_PLAN_PRO_YEARLY=plan_...
RAZORPAY_PLAN_STUDIO_MONTHLY=plan_...
RAZORPAY_PLAN_STUDIO_YEARLY=plan_...

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
# For Upstash: redis://default:<password>@<host>.upstash.io:6379

# ── Cloudflare R2 ─────────────────────────────────────────────────────────────
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=videoforge
R2_PUBLIC_URL=https://pub-xxxx.r2.dev

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Running the Project

### Web app (Next.js)

```bash
# From the repo root — starts both web and any dependent packages via Turborepo
npm run dev

# Or start only the web app directly
cd apps/web
npm run dev
# → http://localhost:3000
```

Key pages available at `http://localhost:3000`:
- `/` — Landing page
- `/dashboard` — User dashboard
- `/generate` — Standard video generation (up to 15 seconds)
- `/generate/long-video` — Long-form video generation (30s / 60s / 120s; Creator tier and above)
- `/gallery` — Video gallery
- `/characters` — Character management
- `/pricing` — Plans and credit top-ups

### Background worker (BullMQ)

The worker processes video-generation jobs and must run alongside the web app in development:

```bash
cd apps/web
npm run worker
```

> **Note:** Redis must be running before you start the worker. If Redis is not available the worker will exit immediately with a connection error.

### Mobile app (Expo / React Native)

```bash
cd apps/mobile
npm run dev          # Opens Expo Go QR code in the terminal

# Run on a specific platform
npm run android      # Requires Android Studio + emulator or physical device
npm run ios          # Requires Xcode + simulator (macOS only)
```

Scan the QR code with the **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) to test on a physical device.

### All apps at once (Turborepo)

```bash
# From the repo root — starts web + mobile dev servers in parallel
npm run dev
```

### Build for production

```bash
# Build all workspaces
npm run build

# Build only the web app
npm run build --workspace=apps/web
```

### Lint & type-check

```bash
npm run lint        # ESLint across all packages
npm run typecheck   # tsc --noEmit across all packages
```
