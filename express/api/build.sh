SCRIPTPATH=$(dirname "$SCRIPT")

docker build -t nub31/vscode-vs-theme-converter:backend -f $SCRIPTPATH/docker/Dockerfile $SCRIPTPATH &&
docker push nub31/vscode-vs-theme-converter:backend