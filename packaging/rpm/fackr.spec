Name:           fackr
Version:        0.1.0
Release:        1%{?dist}
Summary:        Terminal text editor in Rust with VSCode-style keybindings

License:        MIT
URL:            https://github.com/TenseleyFlow/fackr
Source0:        %{name}-%{version}.tar.gz

BuildArch:      x86_64 aarch64

# Disable debug package
%global debug_package %{nil}

BuildRequires:  rust
BuildRequires:  cargo

# Conflicts with the Fortran version
Conflicts:      facsimile

%description
fackr is a terminal text editor written in Rust featuring VSCode-style
keybindings. It is a port of the original facsimile editor (written in
Fortran) with a focus on performance and memory safety.

Features:
- VSCode-style keybindings (Ctrl+C/V/X, Ctrl+S, Ctrl+D, etc.)
- Rope-based text buffer for efficient large file handling
- Syntax highlighting for multiple languages
- File tree navigation
- Search and replace functionality
- Undo/redo system
- Bracket matching
- Cross-platform (Linux, macOS)

%prep
%autosetup

%build
cargo build --release

%install
mkdir -p %{buildroot}%{_bindir}
install -Dm755 target/release/fac %{buildroot}%{_bindir}/fac

# Install documentation
mkdir -p %{buildroot}%{_docdir}/%{name}
install -Dm644 README.md %{buildroot}%{_docdir}/%{name}/README.md 2>/dev/null || true

%files
%doc README.md
%{_bindir}/fac

%changelog
* Sat Dec 07 2025 mfw <espadon@outlook.com> - 0.1.0-1
- Initial RPM release of fackr
- Terminal text editor with VSCode-style keybindings
- Rust port of facsimile
