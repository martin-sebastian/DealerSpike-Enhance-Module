# Define variables for paths and GitHub repo
$repositoryPath = "C:\repos\DealerSpike-Enhance-Module"
$webRootPath = "C:\inetpub\wwwroot\app"
$branch = "main"
$repositoryUrl = "https://github.com/martin-sebastian/DealerSpike-Enhance-Module.git"

# Check if the repository directory exists
if (!(Test-Path -Path $repositoryPath)) {
    Write-Host "Project directory does not exist. Cloning repository..."
    git clone $repositoryUrl $repositoryPath
} else {
    # Navigate to the project directory
    Write-Host "Navigating to the project directory..."
    Set-Location -Path $repositoryPath

    # Pull the latest code from the main branch
    Write-Host "Pulling the latest code from the $branch branch..."
    git checkout $branch
    git pull origin $branch
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Remove any old files from the deployment directory
Write-Host "Clearing old files from the web root..."
Remove-Item -Path "$webRootPath\*" -Recurse -Force -ErrorAction Stop

# Copy project files to the web server directory
Write-Host "Copying files to the web root, excluding node_modules and .git..."
Get-ChildItem -Path $repositoryPath -Recurse -Exclude 'node_modules', '.git' |
    Copy-Item -Destination $webRootPath -Recurse -Force -ErrorAction Stop

# Completion message
Write-Host "Deployment complete!"
