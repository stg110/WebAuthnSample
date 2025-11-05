# Simple PowerShell HTTP Server for WebAuthn Sample
# Usage: .\start-server.ps1

$port = 8000
$url = "http://localhost:$port"

Write-Host "Starting simple HTTP server on $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    # Create HTTP listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("$url/")
    $listener.Start()
    
    Write-Host "Server started successfully!" -ForegroundColor Green
    Write-Host "Open your browser and navigate to: $url" -ForegroundColor Cyan
    Write-Host ""
    
    # Set up MIME types
    $mimeTypes = @{
        '.html' = 'text/html'
        '.htm'  = 'text/html'
        '.js'   = 'application/javascript'
        '.css'  = 'text/css'
        '.json' = 'application/json'
        '.png'  = 'image/png'
        '.jpg'  = 'image/jpeg'
        '.jpeg' = 'image/jpeg'
        '.gif'  = 'image/gif'
        '.svg'  = 'image/svg+xml'
        '.ico'  = 'image/x-icon'
    }
    
    while ($listener.IsListening) {
        # Wait for incoming request
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get requested path
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - $($request.HttpMethod) $path" -ForegroundColor Gray
        
        try {
            if (Test-Path $filePath -PathType Leaf) {
                # File exists, serve it
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                
                if ($mimeTypes.ContainsKey($extension)) {
                    $response.ContentType = $mimeTypes[$extension]
                } else {
                    $response.ContentType = 'application/octet-stream'
                }
                
                $response.ContentLength64 = $content.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($content, 0, $content.Length)
            } else {
                # File not found
                $errorContent = "<html><body><h1>404 - File Not Found</h1><p>The requested file '$path' was not found.</p></body></html>"
                $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
                
                $response.ContentType = 'text/html'
                $response.StatusCode = 404
                $response.ContentLength64 = $errorBytes.Length
                $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
            }
        }
        catch {
            Write-Host "Error serving file: $_" -ForegroundColor Red
            $response.StatusCode = 500
        }
        finally {
            $response.OutputStream.Close()
        }
    }
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
}
finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        Write-Host "`nServer stopped." -ForegroundColor Yellow
    }
}