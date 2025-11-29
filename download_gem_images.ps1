$images = @(
    @{ Url = "https://cdn.poedb.tw/image/Art/2DArt/UIImages/InGame/ItemsHeaderGemLeft.webp"; Path = "public/images/ui/ItemsHeaderGemLeft.webp" },
    @{ Url = "https://cdn.poedb.tw/image/Art/2DArt/UIImages/InGame/ItemsHeaderGemRight.webp"; Path = "public/images/ui/ItemsHeaderGemRight.webp" },
    @{ Url = "https://cdn.poedb.tw/image/Art/2DArt/UIImages/InGame/ItemsHeaderGemMiddle.webp"; Path = "public/images/ui/ItemsHeaderGemMiddle.webp" }
)

foreach ($img in $images) {
    $dir = Split-Path -Parent $img.Path
    if (!(Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    if (!(Test-Path -Path $img.Path)) {
        Write-Host "Downloading $($img.Url) to $($img.Path)..."
        try {
            Invoke-WebRequest -Uri $img.Url -OutFile $img.Path -UserAgent "Mozilla/5.0"
        }
        catch {
            Write-Error "Failed to download $($img.Url): $_"
        }
    } else {
        Write-Host "Skipping $($img.Path) (already exists)"
    }
}
