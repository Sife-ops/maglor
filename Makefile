build:
	npm install
	rm -rf ./dist
	npm run build
	npm run ncc

install:
	chmod +x ./ncc/index.js
	cp ./ncc/index.js /usr/local/bin/maglor
