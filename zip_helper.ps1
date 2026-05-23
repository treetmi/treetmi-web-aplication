# Create temporary directories
$tempDir = New-Item -ItemType Directory -Path "f:\Planning Project\streamplay-id\temp_build" -Force
$tempBackend = New-Item -ItemType Directory -Path "$tempDir\backend-api" -Force
$tempFrontend = New-Item -ItemType Directory -Path "$tempDir\frontend-app" -Force

# Copy backend files excluding node_modules, .env
Write-Host "Copying backend files..."
Copy-Item -Path "f:\Planning Project\streamplay-id\backend-api\*" -Destination $tempBackend -Recurse -Exclude "node_modules", ".env", "package-lock.json" -Force

# Copy frontend files excluding node_modules, .next, .env files
Write-Host "Copying frontend files..."
Copy-Item -Path "f:\Planning Project\streamplay-id\frontend-app\*" -Destination $tempFrontend -Recurse -Exclude "node_modules", ".next", ".env*", "package-lock.json", ".git" -Force

# Compress to zip files
Write-Host "Compressing backend files into backend-update.zip..."
Compress-Archive -Path "$tempBackend\*" -DestinationPath "f:\Planning Project\streamplay-id\backend-update.zip" -Force

Write-Host "Compressing frontend files into frontend-update.zip..."
Compress-Archive -Path "$tempFrontend\*" -DestinationPath "f:\Planning Project\streamplay-id\frontend-update.zip" -Force

# Clean up
Write-Host "Cleaning up temporary files..."
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Successfully generated backend-update.zip and frontend-update.zip!"
