# facsimile website

Website for hosting downloads and documentation for facsimile terminal text editor (Fortran and Rust versions).

## Structure

```
fac-web/
├── site/                    # Astro static site
│   ├── src/
│   │   ├── layouts/         # Base layout with dark theme
│   │   └── pages/           # Home and downloads pages
│   ├── public/
│   │   └── releases/        # Binary downloads
│   │       ├── fortran/     # Fortran version binaries
│   │       └── rust/        # Rust version binaries
│   ├── scripts/
│   │   └── add-release.js   # Release management CLI
│   └── versions.json        # Version history for both implementations
├── nginx/                   # Server configuration
│   └── facsimile.musicsian.com.conf
├── packaging/               # Package manager files
│   ├── aur/                 # Arch Linux PKGBUILD
│   ├── homebrew/            # Homebrew formula
│   └── rpm/                 # RPM spec file
└── deploy.sh                # Deployment script
```

## Development

```bash
cd site
npm install
npm run dev
```

## Adding a Release

```bash
# Add a Fortran release
npm run add-release -- \
  --lang fortran \
  --version 1.0.0 \
  --file /path/to/facsimile-linux-x86_64.tar.gz \
  --platform Linux \
  --arch x86_64 \
  --changelog "Release notes here"

# Add a Rust release
npm run add-release -- \
  --lang rust \
  --version 0.2.0 \
  --file /path/to/fac-linux-x86_64.tar.gz \
  --platform Linux \
  --arch x86_64 \
  --changelog "Initial rust release"
```

## Deployment

First-time setup:
```bash
./deploy.sh --setup
```

Deploy updates:
```bash
./deploy.sh
```

## Packaging

### AUR (Arch Linux)

The PKGBUILD is in `packaging/aur/`. To publish:
1. Update version in PKGBUILD
2. Update sha256sums
3. Update .SRCINFO
4. Push to AUR

### Homebrew

The formula is in `packaging/homebrew/`. To publish:
1. Update version and sha256 in formula
2. Submit to homebrew-fackr tap

### RPM (Fedora/RHEL)

The spec file is in `packaging/rpm/`. To build:
```bash
rpmbuild -ba packaging/rpm/fackr.spec
```
