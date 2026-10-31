$ErrorActionPreference='Stop'
$folder=$PSScriptRoot
try {
 $name='BreakTime-M24-P21-LAN-2724'
 $node='C:\Users\higgi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
 $ip=Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 | Where-Object IPAddress -eq '192.168.1.166'
 if(!$ip){throw 'Wi-Fi address changed. Do not create this rule; reverify the LAN address.'}
 $profile=Get-NetConnectionProfile -InterfaceAlias 'Wi-Fi'
 if([string]$profile.NetworkCategory -ne 'Private'){throw 'Wi-Fi is not Private. No firewall or network-profile change was made.'}
 $existing=Get-NetFirewallRule -Name $name -ErrorAction SilentlyContinue
 if(!$existing){
  New-NetFirewallRule -Name $name -DisplayName 'BREAK TIME M24 Protocol 21 LAN TCP 2724 Private' -Direction Inbound -Action Allow -Enabled True -Profile Private -Protocol TCP -LocalPort 2724 -LocalAddress '192.168.1.166' -RemoteAddress '192.168.1.0/24' -Program $node | Out-Null
 }
 $rule=Get-NetFirewallRule -Name $name
 $port=$rule | Get-NetFirewallPortFilter
 $address=$rule | Get-NetFirewallAddressFilter
 $app=$rule | Get-NetFirewallApplicationFilter
 if([string]$rule.Enabled -ne 'True' -or [string]$rule.Profile -ne 'Private' -or [string]$rule.Action -ne 'Allow' -or [string]$port.LocalPort -ne '2724' -or [string]$port.Protocol -ne 'TCP' -or $address.LocalAddress -notcontains '192.168.1.166' -or (@($address.RemoteAddress).Count -ne 1 -or ($address.RemoteAddress -notcontains '192.168.1.0/24' -and $address.RemoteAddress -notcontains '192.168.1.0/255.255.255.0')) -or $app.Program -ne $node){throw ('Preview scope verification mismatch: '+(@{Enabled=[string]$rule.Enabled;Profile=[string]$rule.Profile;Action=[string]$rule.Action;Port=[string]$port.LocalPort;Protocol=[string]$port.Protocol;Local=$address.LocalAddress;Remote=$address.RemoteAddress;Program=$app.Program} | ConvertTo-Json -Compress))}
 [ordered]@{status='PASS';name=$name;profile=[string]$rule.Profile;direction=[string]$rule.Direction;action=[string]$rule.Action;enabled=[string]$rule.Enabled;protocol=[string]$port.Protocol;port=$port.LocalPort;localAddress=$address.LocalAddress;remoteAddress=$address.RemoteAddress;program=$app.Program;firewallProfiles=@(Get-NetFirewallProfile | Select-Object Name,Enabled);checkedAt=(Get-Date -Format o)} | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $folder 'firewall-result.json')
} catch {
 [ordered]@{status='BLOCKED';error=$_.Exception.Message;checkedAt=(Get-Date -Format o)} | ConvertTo-Json | Set-Content (Join-Path $folder 'firewall-result.json')
 exit 1
}
