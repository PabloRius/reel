{
  description = "Movie/Series Picker — Next.js + TypeScript + Tailwind + Firebase";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_22;
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            nodejs
            pkgs.pnpm
            pkgs.typescript-language-server
            pkgs.vscode-langservers-extracted # eslint/html/css/json language servers
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"
            echo "🎬 Movie Picker dev shell"
            echo "   node $(node --version) · pnpm $(pnpm --version)"
          '';
        };
      });
}
