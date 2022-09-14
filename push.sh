if [ -z "$1" ]; then
	echo "Provide a git commit message" 
else
	git add . &&
	git commit -m $1 &&
	git push origin &&

	# sh express/host/build.sh &&
	sh express/api/build.sh
fi