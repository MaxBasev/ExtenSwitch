#!/bin/bash

# Name of the output file
OUTPUT_FILE="ExtenSwitch_v1.2.zip"

# Remove old zip if exists
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
fi

# Create new zip
# -r: recursive
# -x: exclude patterns
# We zip everything in current directory (.) to avoid creating a parent folder inside the zip
zip -r "$OUTPUT_FILE" . -x "*.git*" -x "*.DS_Store*" -x "*.zip" -x "README.md" -x "package.sh"

echo "✅ Package created: $OUTPUT_FILE"
echo "You can now upload this file to Chrome Web Store."
