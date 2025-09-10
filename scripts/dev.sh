ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "ROOT_DIR: $ROOT_DIR"

echo "[1/6] Ensuring pnpm is available…"
if ! command -v pnpm >/dev/null 2>&1; then
    if command -v brew >/dev/null 2>&1; then
        echo "pnpm not found; installing via Homebrew…"
        brew install pnpm
    else
        echo "pnpm is required. Install via Corepack or Homebrew and rerun." >&2
        exit 1
    fi
fi

echo "[2/6] Installing workspace deps…"
pnpm install

echo "[3/6] Generating Prisma Client…"
pnpm exec prisma generate --schema prisma/schema.prisma

echo "[4/6] Resetting DB (delete only)…"
pnpm run db:reset

echo "[5/6] Seeding + validating DB…"
pnpm run db:all

echo "[6/6] Building shared models…"
pnpm --filter "@data/models" run build

echo "[done] Starting API (dev)…"
pnpm --filter "@app/api" run dev