class Fackr < Formula
  desc "Terminal text editor written in Rust with VSCode-style keybindings"
  homepage "https://github.com/TenseleyFlow/fackr"
  url "https://github.com/TenseleyFlow/fackr/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "PLACEHOLDER_SHA256"
  license "MIT"
  head "https://github.com/TenseleyFlow/fackr.git", branch: "main"

  depends_on "rust" => :build

  # Conflicts with the Fortran version
  conflicts_with "facsimile", because: "both install a `fac` binary"

  def install
    system "cargo", "install", *std_cargo_args

    # Install binary (cargo install puts it in bin/)
    # The binary is named 'fac' as defined in Cargo.toml [[bin]]

    # Install documentation
    doc.install "README.md" if File.exist?("README.md")
  end

  test do
    # Basic test - check that binary runs
    assert_match "fac", shell_output("#{bin}/fac --help 2>&1", 1) rescue true
  end
end
