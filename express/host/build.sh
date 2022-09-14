rm -r ./src/dist
npm run build --prefix ../../react &&
mv ../../react/dist ./src &&

docker build -t nub31/vscode-vs-theme-converter:frontend -f docker/Dockerfile . &&
docker push nub31/vscode-vs-theme-converter:frontend