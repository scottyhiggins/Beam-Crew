$ErrorActionPreference = 'Stop'
$ruleName = 'BREAK TIME M28 Protocol 22 LAN TCP 2728 Private'
New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Enabled True -Profile Private -Protocol TCP -LocalPort 2728 -LocalAddress 192.168.1.166 -RemoteAddress LocalSubnet -InterfaceAlias 'Wi-Fi' -Program 'C:\Users\higgi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' | Out-Null
Get-NetFirewallRule -DisplayName $ruleName | Select-Object DisplayName, Enabled, Profile, Direction, Action | ConvertTo-Json | Set-Content 'C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\Beam-Crew-m28-final-combined\qa\m28\firewall-admin-result.json'
