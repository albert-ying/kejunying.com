#!/bin/sh
#
# Convert PDF CV to HTML
# Uses PyMuPDF (pip install PyMuPDF) - no Docker required
#

cd content/cv

python3 << 'PYTHON'
import fitz  # PyMuPDF

doc = fitz.open("Ying_cv.pdf")

# Extract text as HTML with clean styling
html_content = []
html_content.append('''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - Kejun Albert Ying</title>
    <style>
        body {
            font-family: 'EB Garamond', 'Times New Roman', serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.5;
            color: #333;
            background: #faf8f5;
        }
        .page {
            background: white;
            padding: 40px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 4px;
        }
        p { margin: 0.3em 0; }
        b { font-weight: 600; }
        @media print {
            .page { box-shadow: none; margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
''')

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text("html")
    html_content.append(f'<div class="page">{text}</div>')

html_content.append('</body></html>')

with open("Ying_cv_converted.html", 'w') as f:
    f.write('\n'.join(html_content))

print(f"Converted {len(doc)} pages to Ying_cv_converted.html")
PYTHON

cd ../..

# Copy to static folder for Hugo
mkdir -p static/cv
cp content/cv/Ying_cv_converted.html static/cv/Ying_cv.html

echo "Done! HTML copied to static/cv/Ying_cv.html"
