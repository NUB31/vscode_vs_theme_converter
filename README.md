# Visual Studio Code To Visual Studio Theme Converter

## Step by Step instructions

1. Open Visual Studio Code and apply the theme you want to convert
2. Open the command palette by pressing ctrl + shift + p
3. Start typing "Generate Color Theme" and hit enter on the option "Generate Color Theme From Current Settings"
4. Save this file anywhere
5. Go to <a target='blank' href='https://tc.oliste.no'>tc.oliste.no</a> and upload the file you just saved
6. Hit convert and wait a few moments
7. A .exe file will be downloaded automatically (Make sure you allow popups on firefox)
8. IMPORTANT: If you have Visual Studio running, save all your work. The next step will forcefully close any instances ov Visual Studio
9. Run the .exe file as an Administrator and select your installation path of Visual Studio
10. Click "Install theme" and wait a few moments
11. When the program is done, open Visual Studio and open a project
12. In the toolbar, click on "Tools" and then on "Themes"
13. Select the theme with the same name as the one you uploaded
14. Enjoy

## Q/A

- ### What is this?

  As the title might suggest, this is a tool for converting a VScode json file, to a Visual Studio pkgdef file. Returns a executable that will install the theme and update the Visual Studio configuration.
  The project is based on <a target='blank' href='https://github.com/microsoft/theme-converter-for-vs'>this tool</a> released by Microsoft.
  The website frontend will take a json or jsonc file, and convert it to pkgdef using the tool created by Microsoft. It will then put this file into a C# project under /api/src/scripts/generateExecutable and compile it.
  The generated exe will be put into a public folder, and the url will be sent to the frontend and downloaded.

- ### How do i apply the theme after running the tool?
  This tool creates an exe file, which will copy the theme into the visual studio folder, and run a configuration update command.

1. Just run the generated exe as an administrator, and select the installation path of your visual studio. Then click "Install theme" and wait.
2. Open visual studio and click tools, then themes, and finally select the theme you uploaded. The theme will have the same name as the file you uploaded to the website.

- ### How can i use this?

  The tool is hosted on <a target='blank' href='https://tc.oliste.no'>tc.oliste.no</a>, or you can use the docker compose file in the root of the project to host it yourself

- ### Why do i have to run some shady exe file?
  When installing a theme to visual studio, you have to run a command to update the visual studio configuration. The theme will not show up otherwise. You are free to read the source code and create the docker image yourself if you are unsure about the generated exe file.
