Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('public\images\latte_art.png')
$bitmap = new-object System.Drawing.Bitmap($img, 64, 64)
$icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
$fs = [System.IO.FileStream]::new('public\cafe.ico', [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$img.Dispose()
$bitmap.Dispose()
