using System.Diagnostics;

namespace vsThemeApplyer
{

    public partial class Form1 : Form
    {
        static string installPath = @"C:\Program Files\Microsoft Visual Studio\2022\Community";
        static string extensionPath = $"{installPath}\\Common7\\IDE\\CommonExtensions\\Platform";
        static string executablePath = $"{installPath}\\Common7\\IDE\\devenv.exe";

        public Form1()
        {
            InitializeComponent();
            txtFilePath.Text = installPath;
        }

        private void btnBrowse_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog folderDlg = new FolderBrowserDialog();
            folderDlg.ShowNewFolderButton = true;
            //Show the FolderBrowserDialog.
           DialogResult result = folderDlg.ShowDialog();
            if (result == DialogResult.OK)
            {
                txtFilePath.Text = folderDlg.SelectedPath;
                installPath = folderDlg.SelectedPath;
            }
        }

        private async void btnApply_Click(object sender, EventArgs e)
        {
            if (Directory.Exists(installPath) && File.Exists(executablePath) && Directory.Exists(extensionPath))
            {
                lblStatus.ForeColor = Color.Blue;
                lblStatus.Text = "Stopping Visual Studio processes";

                Process[] vsInstances = Process.GetProcessesByName("devenv");
                foreach (Process vs in vsInstances)
                {
                    vs.Kill();
                    vs.WaitForExit();
                    vs.Dispose();
                }

                lblStatus.ForeColor = Color.Blue;
                lblStatus.Text = "Copying theme file to extension folder";
                if (File.Exists($"{extensionPath}/ConvertedVsCodeTheme.pkgdef"))
                {
                    lblStatus.ForeColor = Color.Blue;
                    lblStatus.Text = "Deleting theme with same name";
                    File.Delete($"{extensionPath}/ConvertedVsCodeTheme.pkgdef");
                    var updateConfigDeleteProcess = Process.Start(executablePath, "/updateconfiguration");
                    updateConfigDeleteProcess.WaitForExit();
                    if (updateConfigDeleteProcess.ExitCode != 0)
                    {
                        lblStatus.ForeColor = Color.Red;
                        lblStatus.Text = "Configuration update failed";
                        return;
                    }
                }
                using (FileStream fs = File.Create($"{extensionPath}/Theme.ConvertedVsCodeTheme.pkgdef"))
                {
                    try
                    {
                        await fs.WriteAsync(Properties.Resources.ThemeToConvert);
                    }
                    catch (Exception)
                    {
                        lblStatus.ForeColor = Color.Red;
                        lblStatus.Text = "Could not write to theme file";
                        return;
                    }

                }
                lblStatus.ForeColor = Color.Blue;
                lblStatus.Text = "Updating Visual Studio configuration";
                var updateConfigProcess = Process.Start(executablePath, "/updateconfiguration");
                updateConfigProcess.WaitForExit();
                if (updateConfigProcess.ExitCode != 0)
                {
                    lblStatus.ForeColor = Color.Red;
                    lblStatus.Text = "Configuration update failed";
                    return;
                }
                lblStatus.ForeColor = Color.Green;
                lblStatus.Text = "Theme installed, Launching Visual Studio";
                Process.Start(executablePath);
                lblStatus.ForeColor = Color.Black;
                lblStatus.Text = "To apply your theme, select 'Tools' > 'Theme' > 'The long theme'";
            }
            else
            {
                lblStatus.ForeColor = Color.Red;
                lblStatus.Text = "Visual studio installation not found in selected path";
            }
        }
    }
}