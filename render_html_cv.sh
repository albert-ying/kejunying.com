#!/bin/sh
#
# Convert PDF CV to HTML and copy to static folder for serving
#
cd content/cv
docker run -ti --rm --mount src="$(pwd)",target=/pdf,type=bind pdf2htmlex/pdf2htmlex:0.18.8.rc2-master-20200820-alpine-3.12.0-x86_64 --data-dir pdf2htmlEX --zoom 1.2 Ying_cv.pdf
cd ../..

# Copy to static folder so Hugo serves it correctly
mkdir -p static/cv
cp content/cv/Ying_cv.html static/cv/Ying_cv.html
cp -r content/cv/pdf2htmlEX static/cv/

echo "CV HTML generated and copied to static/cv/"
