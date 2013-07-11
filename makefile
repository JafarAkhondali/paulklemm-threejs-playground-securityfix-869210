all:
	cd ./three.js/utils/build; \
		python build.py --include common
	npm install
clean:
	rm -r ./node_modules
	cd ./three.js; \
		git checkout .