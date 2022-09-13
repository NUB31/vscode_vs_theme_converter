using System.Security.Principal;

namespace vsThemeApplyer
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            if (!IsUserAdministrator()) throw new UnauthorizedAccessException("Please run as administrator");
            ApplicationConfiguration.Initialize();
            Application.Run(new Form1());
        }
        public static bool IsUserAdministrator()
        {
            bool isAdmin;
            try
            {
                WindowsIdentity user = WindowsIdentity.GetCurrent();
                WindowsPrincipal principal = new WindowsPrincipal(user);
                isAdmin = principal.IsInRole(WindowsBuiltInRole.Administrator);
            }
            catch (UnauthorizedAccessException ex)
            {
                isAdmin = false;
            }
            catch (Exception ex)
            {
                isAdmin = false;
            }
            return isAdmin;
        }
    }

}