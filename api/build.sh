SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH 
docker build -t nub31/vscode-vs-theme-converter:backend . &&
docker push nub31/vscode-vs-theme-converter:backend