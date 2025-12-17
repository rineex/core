#!/usr/bin/env bash
shopt -s globstar

echo "Running post-build steps..."

# Recursively find all JS files in ./cjs
find "./cjs" -type f -name "*.js" | while read -r file; do
  # Use perl for safer in-place replacement
  perl -i -pe '
    # Skip lines that are comments
    next if m{^\s*//} || m{^\s*/\*};

    # Replace require("*.mjs") with require("*.js")
    s{require\(\s*"([^"]+)\.mjs"\s*\)}{require("$1.js")}g
  ' "$file"
done
