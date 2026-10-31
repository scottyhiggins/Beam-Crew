$ErrorActionPreference='Stop'
trap { $_ | Out-String | Set-Content 'C:\Users\higgi\.codex\.chatgpt-projects\g-p-6ac291cf8ecc81919bbc636308fbf05d\Beam-Crew-m29-final-all-features\qa\m29\firewall-error.txt'; exit 1 }
$taskRoot=Split-Path $PSScriptRoot -Parent
$taskWifi=Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 | Where-Object {$_.AddressState -eq 'Preferred' -and $_.IPAddress -notlike '169.254.*'}
if(@($taskWifi).Count -ne 1){throw 'Expected exactly one preferred Wi-Fi IPv4 address'}
$taskProfile=Get-NetConnectionProfile -InterfaceAlias 'Wi-Fi'
if($taskProfile.NetworkCategory -ne 'Private'){throw 'Wi-Fi must already be Private; no network profile was changed'}
$taskNode='C:\Users\higgi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$taskName='BREAK TIME M29 Protocol 23 LAN TCP 2729 Private'
if(Get-NetFirewallRule -DisplayName $taskName -ErrorAction SilentlyContinue){throw 'M29 rule already exists; inspect before changing'}
New-NetFirewallRule -DisplayName $taskName -Direction Inbound -Action Allow -Enabled True -Profile Private -Protocol TCP -LocalPort 2729 -LocalAddress $taskWifi.IPAddress -RemoteAddress LocalSubnet -InterfaceAlias 'Wi-Fi' -Program $taskNode | Out-Null
$taskRule=Get-NetFirewallRule -DisplayName $taskName
@{wifi=$taskWifi | Select-Object InterfaceAlias,IPAddress,PrefixLength;network=$taskProfile | Select-Object InterfaceAlias,NetworkCategory;rule=$taskRule | Select-Object DisplayName,Enabled,Profile,Direction,Action;port=$taskRule | Get-NetFirewallPortFilter | Select-Object Protocol,LocalPort,RemotePort;address=$taskRule | Get-NetFirewallAddressFilter | Select-Object LocalAddress,RemoteAddress;application=$taskRule | Get-NetFirewallApplicationFilter | Select-Object Program;interface=$taskRule | Get-NetFirewallInterfaceFilter | Select-Object InterfaceAlias;profiles=Get-NetFirewallProfile | Select-Object Name,Enabled} | ConvertTo-Json -Depth 6 | Set-Content "$taskRoot/qa/m29/network-firewall.json"

