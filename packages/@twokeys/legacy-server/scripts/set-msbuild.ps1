npm config set msvs_version 2019
$MSBUILD_PATH = (C:\hostedtoolcache\windows\vswhere\2.7.1\x64\vswhere.exe -latest -requires Microsoft.Component.MSBuild -find MSBuild\**\Bin\MSBuild.exe) | Out-String
npm config set msbuild_path "$MSBUILD_PATH\MSBuild.exe"