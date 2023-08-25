if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    [System.Windows.Forms.Messagebox]::Show("Please run script as an administrator!");
    exit 14
}

$uuid = @'
{{PKGDEF_UUID}}
'@

$content = @'
{{PKGDEF_CONTENT}}
'@

Clear-Host
$installationPath = 'C:\Program Files\Microsoft Visual Studio\2022\Community'

$title    = 'Choose Visual Studio installation location'
$question = "Is '$installationPath' the correct path for your visual studio installation?"

$choices = New-Object Collections.ObjectModel.Collection[Management.Automation.Host.ChoiceDescription]
$choices.Add((New-Object Management.Automation.Host.ChoiceDescription -ArgumentList '&Yes'))
$choices.Add((New-Object Management.Automation.Host.ChoiceDescription -ArgumentList '&No'))

$decision = $Host.UI.PromptForChoice($title, $question, $choices, 1)

if ($decision -eq 0) {
} else {
	$installationPath = Read-Host -Prompt 'Please input your visual studio installation path'
}

$extensionPath = "$installationPath\Common7\IDE\CommonExtensions\Platform"
$executableFilePath = "$installationPath\Common7\IDE\devenv.exe"

$content | Out-File -FilePath "$extensionPath\$uuid.pkgdef"

$devenvInstance = Get-Process devenv -ErrorAction SilentlyContinue
if ($devenvInstance) {
  $devenvInstance.CloseMainWindow()
  Sleep 5
  if (!$devenvInstance.HasExited) {
    $devenvInstance | Stop-Process -Force
  }
}

try {
    Start-Process -FilePath $executableFilePath -ArgumentList "/updateconfiguration"


$animation = @"
(>'-')>
#
^('-')^
#
<('-'<)
#
^('-')^
"@

Write-Host -F Green "Complete! press any key to stop"
do {
    foreach ($frame in $animation.Split("#").Trim()) {
        Write-Host -F Green "`r$frame" -NoNewline
        Start-Sleep -Milliseconds 200
    }
} until([System.Console]::KeyAvailable)
}
catch {
    Write-Error Could not update visual studio configuration
}