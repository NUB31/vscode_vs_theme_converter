docker stop theme_converter
docker build -t theme_converter .
docker run -d --rm --name theme_converter -p 80:3000 theme_converter
docker logs theme_converter --follow