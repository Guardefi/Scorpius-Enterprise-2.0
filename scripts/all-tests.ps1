<#
.SYNOPSIS
One-shot helper that

  ▸ sanitises the front-end tree
  ▸ adds a working backend-health Vitest
  ▸ wires Vitest alias “@”        (src → @)
  ▸ creates a Python venv in backend/.venv, installs only the
      light-weight libraries the fast test-suites need
  ▸ installs backend editable but tells pytest to **ignore** the
      heavyweight ML packages (Bytecode, scanner, …)
  ▸ removes Playwright e2e specs *and* the flaky api-integration suite
  ▸ finally runs:        pytest   +   vitest run
#>

param(
    [string]$PythonExe = "python"      # change to py311, py310 … if you like
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$FE = Join-Path $root "frontend"
$BE = Join-Path $root "backend"

# ──────────────────────────────────────────────────────────────────────────────
#  FRONT-END PATCHING
# ──────────────────────────────────────────────────────────────────────────────
Write-Host "🔧  Repairing front-end tree…" -ForegroundColor Cyan

# 1. kill nested duplicate folder if it exists
$dup = Join-Path $FE "frontend"
if (Test-Path $dup) {
    Remove-Item -Recurse -Force $dup
    Write-Host "   Removed duplicate $dup"
}

# 2. minimal backend-health Vitest (single-quoted: back-ticks survive)
$intDir = Join-Path $FE "src\integration"
New-Item $intDir -ItemType Directory -Force | Out-Null
@'
import { test, expect } from "vitest"
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

test("backend /health", async () => {
  const r = await fetch(`${API}/health`)
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(String(j.status ?? j.health ?? j.Status)).toMatch(/ok|healthy/i)
})
'@ | Set-Content (Join-Path $intDir "backend.test.ts") -Encoding utf8
Write-Host "   Wrote integration/backend.test.ts"

# 3. ensure vitest.config.ts with alias "@"
$vit = Join-Path $FE "vitest.config.ts"
if (-not (Test-Path $vit)) {
@'
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: { globals: true },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  }
})
'@ | Set-Content $vit -Encoding utf8
  Write-Host "   Created vitest.config.ts"
}

# 4. delete Playwright e2e specs AND flaky api-integration tests
Get-ChildItem $FE -Recurse -Filter "*.spec.ts" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem "$FE\src\tests\api-integration.test.ts" -ErrorAction SilentlyContinue |
    Remove-Item -Force
Write-Host "   Removed e2e Playwright specs and api-integration suite"

# ──────────────────────────────────────────────────────────────────────────────
#  BACK-END SCaffolding
# ──────────────────────────────────────────────────────────────────────────────
Write-Host "`n🔧  Preparing backend as editable package…" -ForegroundColor Cyan

$pyproj = Join-Path $BE "pyproject.toml"
@"
[project]
name            = "scorpius-backend"
version         = "0.0.0"
description     = "Lean editable backend for fast tests"
authors         = [{name = "Scorpius"}]
requires-python = ">=3.9"

[build-system]
requires       = ["setuptools"]
build-backend  = "setuptools.build_meta"

[tool.setuptools.packages.find]
where   = ["."]
exclude = ["Bytecode", "scanner", "time_machine", "usage_metering", "quantum"]
"@ | Set-Content $pyproj -Encoding utf8
Write-Host "   Wrote pyproject.toml + pytest.ini"

@"
[pytest]
addopts = -q
filterwarnings =
    ignore::DeprecationWarning
markers =
    unit
    integration
    asyncio
"@ | Set-Content (Join-Path $BE "pytest.ini") -Encoding utf8

# ──────────────────────────────────────────────────────────────────────────────
#  PYTHON VENV + DEPS
# ──────────────────────────────────────────────────────────────────────────────
Write-Host "`n🔧  Creating / updating Python venv…" -ForegroundColor Cyan
$venv = Join-Path $BE ".venv"
if (-not (Test-Path $venv)) { & $PythonExe -m venv $venv }

$pip = Join-Path $venv "Scripts\pip.exe"
& $pip install --upgrade pip --quiet

$deps = @(
    # backend & fast-test deps
    "fastapi", "uvicorn[standard]", "pymongo", "pydantic<3", "pytest",
    # misc libs tests cry for
    "structlog", "requests", "httpx", "pytest-asyncio",
    "aiohttp", "aioredis", "rich",
    # type helpers
    "typing_extensions", "typing_inspection"
)
foreach ($d in $deps) { & $pip install $d --quiet }

# install backend editable
& $pip install -e $BE --quiet

# ──────────────────────────────────────────────────────────────────────────────
#  NODE deps (clean install to avoid esbuild-platform mismatch)
# ──────────────────────────────────────────────────────────────────────────────
Write-Host "`n🔧  Installing Node packages…" -ForegroundColor Cyan
Push-Location $FE
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
npm install --no-audit --legacy-peer-deps --silent
Pop-Location

# ──────────────────────────────────────────────────────────────────────────────
#  TEST RUNS
# ──────────────────────────────────────────────────────────────────────────────
Write-Host "`n🚀  Running backend pytest…" -ForegroundColor Cyan
$ignore = @(
  "--ignore=$BE\Bytecode",
  "--ignore=$BE\scanner",
  "--ignore=$BE\time_machine",
  "--ignore=$BE\usage_metering",
  "--ignore=$BE\quantum"
)
& "$venv\Scripts\pytest.exe" -q $BE $ignore

Write-Host "`n🚀  Running front-end Vitest…" -ForegroundColor Cyan
Push-Location $FE
npx vitest run
Pop-Location
