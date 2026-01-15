# Script de Upload FTP para RV Car
# INSTRUÇÕES: Preencha as credenciais FTP abaixo

# ============================================
# CONFIGURAÇÕES FTP (PREENCHER)
# ============================================

$ftpServer = "ftp.seudominio.com.br"      # Ex: ftp.bnutech.com.br
$ftpUsername = "seu_usuario_ftp"           # Seu usuário FTP
$ftpPassword = "sua_senha_ftp"             # Sua senha FTP
$ftpRemotePath = "/public_html/rvcar/"     # Pasta de destino no servidor

# ============================================
# NÃO ALTERAR DAQUI PRA BAIXO
# ============================================

$localPath = "$PSScriptRoot\dist"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  RV Car - Upload FTP Automático" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se a pasta dist/ existe
if (-not (Test-Path $localPath)) {
    Write-Host "[ERRO] Pasta dist/ não encontrada!" -ForegroundColor Red
    Write-Host "Execute 'npm run build' primeiro" -ForegroundColor Yellow
    exit 1
}

Write-Host "[=>] Conectando ao servidor FTP..." -ForegroundColor Yellow

try {
    # Criar cliente FTP
    $ftpUri = "ftp://$ftpServer$ftpRemotePath"
    
    # Função para upload de arquivo
    function Upload-File {
        param($localFile, $remotePath)
        
        $fileName = Split-Path $localFile -Leaf
        $remoteUri = "$remotePath$fileName"
        
        Write-Host "  [=>] Enviando: $fileName" -ForegroundColor Gray
        
        $ftpRequest = [System.Net.FtpWebRequest]::Create($remoteUri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $ftpRequest.ContentLength = $fileContent.Length
        
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        Write-Host "  [OK] $fileName enviado" -ForegroundColor Green
    }
    
    # Função para criar diretório
    function Create-FtpDirectory {
        param($remotePath)
        
        try {
            $ftpRequest = [System.Net.FtpWebRequest]::Create($remotePath)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
            $response = $ftpRequest.GetResponse()
            $response.Close()
        }
        catch {
            # Diretório já existe, ignorar
        }
    }
    
    # Criar pasta assets/ se não existir
    Create-FtpDirectory "$ftpUri/assets/"
    
    # Upload arquivos principais
    Write-Host ""
    Write-Host "[=>] Enviando arquivos principais..." -ForegroundColor Yellow
    Upload-File "$localPath\index.html" $ftpUri
    Upload-File "$localPath\404.html" $ftpUri
    
    # Upload assets/
    Write-Host ""
    Write-Host "[=>] Enviando assets..." -ForegroundColor Yellow
    $assetsFiles = Get-ChildItem "$localPath\assets" -File
    foreach ($file in $assetsFiles) {
        Upload-File $file.FullName "$ftpUri/assets/"
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  [SUCESSO] Upload concluído!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Arquivos enviados:" -ForegroundColor Cyan
    Write-Host "  - index.html" -ForegroundColor White
    Write-Host "  - 404.html" -ForegroundColor White
    Write-Host "  - assets/ ($($assetsFiles.Count) arquivos)" -ForegroundColor White
    Write-Host ""
    Write-Host "Teste o site: https://bnutech.com.br/rvcar/" -ForegroundColor Cyan
    Write-Host ""
    
}
catch {
    Write-Host ""
    Write-Host "[ERRO] Falha no upload: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "  - Credenciais FTP estão corretas?" -ForegroundColor White
    Write-Host "  - Servidor FTP está acessível?" -ForegroundColor White
    Write-Host "  - Firewall não está bloqueando?" -ForegroundColor White
    exit 1
}
