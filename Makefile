build:
	npm install
	npm run build
	npm run ncc

install:
	chmod +x ./ncc/index.js
	cp ./ncc/index.js /usr/local/bin/maglor
