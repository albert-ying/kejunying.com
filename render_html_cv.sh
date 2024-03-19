#! bin/sh
#
cd content/cv
docker run -ti --rm --mount src="$(pwd)",target=/pdf,type=bind pdf2htmlex/pdf2htmlex:0.18.8.rc2-master-20200820-alpine-3.12.0-x86_64 --data-dir pdf2htmlEX --zoom 1.2 Ying_cv.pdf
cd ../..
