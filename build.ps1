$ChromiumZip = "chromium.zip"
$FirefoxZip = "firefox.zip"
$OrigDir = Get-Location

# Uncomment the following lines to enable logging
#$MainLog = "build.log"
#$ErrorLog = "build.error.log"

# To display Verbose messages, run $VerbosePreference = "Continue"
# To hide them again, run $VerbosePreference = "SilentlyContinue"

Write-Progress -Activity "Building Improved Intra" -Status "Preparing..." -CurrentOperation "Initializing..." -PercentComplete 0

# Change location to the folder where this script is located
Set-Location -Path "$PSScriptRoot" -ErrorAction Stop

# Check if build.txt exists
# build.txt contains the paths of files to include in the extension
if (-Not (Test-Path -Path "$PSScriptRoot\build.txt")) {
	throw "$PSScriptRoot\build.txt not found"
}

# Uncomment the following lines to force the script to redownload submodules
#Remove-Item -Force -Recurse -Path "$PSScriptRoot\server\*"
#Remove-Item -Force -Recurse -Path "$PSScriptRoot\fixes\galaxygraph"

# Update submodules
Write-Progress -Activity "Building Improved Intra" -Status "Preparing..." -CurrentOperation "Updating submodules..." -PercentComplete 5
git submodule update >"$MainLog" 2>"$ErrorLog"

# Install dependencies for GalaxyGraph and build the submodule
Set-Location -Path "$PSScriptRoot\fixes\galaxygraph" -ErrorAction Stop
Write-Progress -Activity "Building Improved Intra" -Status "Preparing..." -CurrentOperation "Installing dependencies..." -PercentComplete 15
npm install >"$MainLog" 2>"$ErrorLog"
Write-Progress -Activity "Building Improved Intra" -Status "Preparing..." -CurrentOperation "Installing dependencies..." -PercentComplete 35
npm run build-windows >"$MainLog" 2>"$ErrorLog"
Set-Location -Path $PSScriptRoot

# Remove old generated archives
Write-Progress -Activity "Building Improved Intra" -Status "Preparing..." -CurrentOperation "Removing old builds..." -PercentComplete 45
Remove-Item -Force -Path "$ChromiumZip" -ErrorAction Ignore
if (Test-Path -Path "$ChromiumZip") {
	throw "Could not delete $PSScriptRoot\$ChromiumZip (it still exists)"
}
Remove-Item -Force -Path "$FirefoxZip" -ErrorAction Ignore
if (Test-Path -Path "$FirefoxZip") {
	throw "Could not delete $PSScriptRoot\$ChromiumZip (it stil exists)"
}

# Remove temp folder if it exists
Remove-Item -Path "$PSScriptRoot\temp" -Force -Recurse -ErrorAction Ignore
if (Test-Path -Path "$PSScriptRoot\temp") {
	throw "Could not delete $PSScriptRoot\temp folder (it stil exists)"
}

# Create temp folder
New-Item -ItemType "Directory" -Path "$PSScriptRoot\temp" -Force >"$MainLog" -ErrorAction Stop

function GatherZipContents {
	[CmdletBinding()]
	param(
		[Parameter(Mandatory)]
		[int] $StartPercent,

		[Parameter(Mandatory)]
		[int] $MaxIncrease
	)

	# Set up
	$AmountLinesToAdd = (Get-Content -Path "$PSScriptRoot\build.txt").Length
	$IncreaseBy = $MaxIncrease / $AmountLinesToAdd
	$Iterator = 0

	# Read every line of build.txt as a path to add to the zip archive
	foreach ($Line in Get-Content -Path "$PSScriptRoot\build.txt") {
		if ($Line.startsWith("#") ) {
			# Line is a comment, skip it
			continue;
		}

		# Write progress bar
		Write-Progress -Activity "Building Improved Intra" -Status "Gathering files..." -CurrentOperation "Gathering $PSScriptRoot\$Line..." -PercentComplete ($StartPercent + ($IncreaseBy * $Iterator))

		# Replace forward facing slashes with backslashes for Windows support
		$Line = $Line.replace("/", "\")

		# Get the path and the filename
		$Path = Split-Path -Path "$Line"
		$Filename = Split-Path -Leaf "$Line"

		# Get the source path and the destination path
		$SourcePath = Join-Path -Path "$PSScriptRoot" -ChildPath "$Path\"
		$DestPath = (Join-Path -Path "$PSScriptRoot\temp" -ChildPath "$Path\").TrimEnd('\')

		# Make sure the directory to copy to exists before copy, otherwise it will be the name
		New-Item -ItemType "Directory" -Path "$DestPath" -Force >"$MainLog" 2>"$ErrorLog"

		if ($Filename.Equals("*")) {
			$DestPath = Split-Path -Path "$DestPath" # go one directory up to paste in the correct location

			# Recursively copy items
			Write-Verbose "Copy-Item -Force -Path $SourcePath -Filter $Filename -Destination $DestPath -Recurse"
			Copy-Item -Recurse -Path "$SourcePath" -Filter "$Filename" -Destination "$DestPath" -Force
		}
		else {
			# Copy only items in the mentioned directory
			Write-Verbose "Get-ChildItem -Path $PSScriptRoot\$Line | Copy-Item -Force -Destination $DestPath\$_"
			Get-ChildItem -Path "$PSScriptRoot\$Line" | Copy-Item -Force -Destination "$DestPath\$_"
		}

		$Iterator++
	}
}

# Gather the contents for the zip archives to build
GatherZipContents -StartPercent 50 -MaxIncrease 10

# Create archive for Chromium browsers
Write-Progress -Activity "Building Improved Intra" -Status "Building..." -CurrentOperation "Building for Chromium..." -PercentComplete 60
Compress-Archive -Path "$PSScriptRoot\temp\*" -DestinationPath "$ChromiumZip" -Force

# Modify the archive specifically for Firefox
Write-Progress -Activity "Building Improved Intra" -Status "Building..." -CurrentOperation "Preparing Firefox build..." -PercentComplete 70
Remove-Item -Force -Path "$PSScriptRoot\temp\sw.js" -ErrorAction SilentlyContinue
Remove-Item -Force -Path "$PSScriptRoot\temp\manifest.json" -ErrorAction SilentlyContinue
Copy-Item -Path "$PSScriptRoot\manifest-ff.json" -Destination "$PSScriptRoot\temp\manifest.json" -Force -ErrorAction Stop

# Create archive for Firefox browser
Write-Progress -Activity "Building Improved Intra" -Status "Building..." -CurrentOperation "Building firefox.zip..." -PercentComplete 75
Compress-Archive -Path "$PSScriptRoot\temp\*" -DestinationPath "$FirefoxZip" -Force

# Clean up
Write-Progress -Activity "Building Improved Intra" -Status "Finishing..." -CurrentOperation "Cleaning up..." -PercentComplete 95
Remove-Item -Path "$PSScriptRoot\temp" -Force -Recurse -ErrorAction SilentlyContinue

# Let user know we are done building
Write-Progress -Activity "Building Improved Intra" -Status "Done" -CurrentOperation "" -PercentComplete 100

# Set location to what it was before executing the Powershell script
Set-Location -Path $OrigDir
