# Clean Deployment Script for WhatsAppApp
# This copies files to a temporary folder, removes caches, and SCPs them over cleanly.

$source = "e:\Github\HiCoreSlotifyApp"
$targetServer = "root@151.185.41.194:/root/HiCoreSlotifyApp"
$staging = "$env:TEMP\HiCoreSlotifyAppDeploy"

Write-Host "1. Cleaning up old staging folder..."
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Force -Path $staging | Out-Null

Write-Host "2. Copying files to staging (excluding __pycache__, venv, .pyc)..."
# Copy all files but exclude the bad ones
Copy-Item -Path "$source\*" -Destination $staging -Recurse -Exclude "__pycache__", "venv", "*.pyc", "*.pyd", ".env", "appointments.db", ".git"

Write-Host "3. Uploading to server using SCP..."
# We use scp -r to copy the clean staging folder contents to the server
scp -r "$staging\*" $targetServer

Write-Host "Deployment Complete!"
