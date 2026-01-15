# RV Car Solutions - Gerador de Pacote de Instalação
# Este script cria o arquivo rvcar-installer.zip pronto para upload

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  RV Car Solutions - Gerador de Instalador" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configurações
$projectRoot = $PSScriptRoot
$distFolder = Join-Path $projectRoot "dist"
$installFolder = Join-Path $projectRoot "install"
$apiFolder = Join-Path $projectRoot "api"
$outputZip = Join-Path $projectRoot "rvcar-installer.zip"
$tempFolder = Join-Path $projectRoot "temp-installer"

# Verificar se o build existe
if (-not (Test-Path $distFolder)) {
    Write-Host "[ERRO] Pasta dist/ nao encontrada!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute primeiro:" -ForegroundColor Yellow
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Verificar se o instalador existe
if (-not (Test-Path (Join-Path $installFolder "index.php"))) {
    Write-Host "[ERRO] Instalador nao encontrado em install/index.php" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[=>] Preparando arquivos..." -ForegroundColor Yellow

# Remover temp e zip antigos se existirem
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

# Criar pasta temporária
New-Item -ItemType Directory -Path $tempFolder | Out-Null

Write-Host "[OK] Pasta temporaria criada" -ForegroundColor Green

# Copiar arquivos do dist (frontend compilado)
Write-Host "[=>] Copiando frontend (dist/)..." -ForegroundColor Yellow
Copy-Item -Path "$distFolder\*" -Destination $tempFolder -Recurse
Write-Host "[OK] Frontend copiado" -ForegroundColor Green

# Copiar pasta install
Write-Host "[=>] Copiando instalador (install/)..." -ForegroundColor Yellow
Copy-Item -Path $installFolder -Destination $tempFolder -Recurse
Write-Host "[OK] Instalador copiado" -ForegroundColor Green

# Copiar pasta api (sem config.php pois será gerado pelo instalador)
Write-Host "[=>] Copiando API (api/)..." -ForegroundColor Yellow
$tempApiFolder = Join-Path $tempFolder "api"
New-Item -ItemType Directory -Path $tempApiFolder | Out-Null

# Copiar todos os arquivos PHP necessários
$apiFiles = @("vehicles.php", "auth.php", "upload.php", ".htaccess")
foreach ($file in $apiFiles) {
    $sourcePath = Join-Path $apiFolder $file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $tempApiFolder
        Write-Host "  [OK] $file copiado" -ForegroundColor Gray
    }
}
Write-Host "[OK] API copiada (sem config.php)" -ForegroundColor Green

# Criar .htaccess raiz se não existir no dist
$htaccessRaiz = Join-Path $tempFolder ".htaccess"
if (-not (Test-Path $htaccessRaiz)) {
    Write-Host "[=>] Criando .htaccess raiz..." -ForegroundColor Yellow
    $htaccessContent = @"
# RV Car Solutions - Apache Configuration
# Gerado automaticamente

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # HTTPS Redirect
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # API requests
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^(.*)$ $1 [L]
  
  # Install folder
  RewriteCond %{REQUEST_URI} ^/install/
  RewriteRule ^(.*)$ $1 [L]
  
  # Assets
  RewriteCond %{REQUEST_URI} ^/assets/
  RewriteRule ^(.*)$ $1 [L]
  
  # SPA Routing - redirect everything else to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Protect sensitive files
<FilesMatch "(\.env|\.lock|config\.php|\.git)">
  Order allow,deny
  Deny from all
</FilesMatch>
"@
    Set-Content -Path $htaccessRaiz -Value $htaccessContent
    Write-Host "OK .htaccess criado" -ForegroundColor Green
}

# Criar arquivo README.txt com instruções rápidas
Write-Host "Criando README.txt..." -ForegroundColor Yellow
$readmeContent = @'
========================================
  RV Car Solutions - Instalador v2.0.0
========================================

INSTALACAO RAPIDA:
==================

1. Faca upload deste ZIP para public_html/
2. Extraia o arquivo
3. Acesse: https://seudominio.com.br/install/
4. Siga os 4 passos na tela
5. DELETE a pasta /install/ apos concluir!

REQUISITOS:
===========
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Extensoes: mysqli, json, mbstring
- Permissoes de escrita

ESTRUTURA:
==========
/index.html       - Pagina principal
/assets/          - CSS, JS, Imagens
/api/             - Backend PHP
/install/         - Instalador web (DELETE apos instalar!)

CREDENCIAIS PADRAO:
===================
URL: https://seudominio.com.br/admin/login
Usuario: admin
Senha: rvcar2024

IMPORTANTE: Altere a senha apos o login!

DOCUMENTACAO COMPLETA:
======================
install/GUIA-INSTALADOR.md

SUPORTE:
========
WhatsApp: (47) 98448-5492
Email: contato@rvcarlocacoes.com.br
GitHub: https://github.com/betinhochagas/rvcar

Desenvolvido com amor para RV Car Solutions
Blumenau - Santa Catarina
'@
Set-Content -Path (Join-Path $tempFolder "README.txt") -Value $readmeContent
Write-Host "[OK] README.txt criado" -ForegroundColor Green

# Criar arquivo de versão
$versionContent = @'
RV Car Solutions
Versao: 2.0.0
Build: {0}
Instalador: Web Installer
'@ -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Set-Content -Path (Join-Path $tempFolder "VERSION.txt") -Value $versionContent
Write-Host "[OK] VERSION.txt criado" -ForegroundColor Green

# Criar o ZIP
Write-Host ""
Write-Host "[=>] Criando arquivo ZIP..." -ForegroundColor Yellow
Write-Host "    Isso pode levar alguns segundos..." -ForegroundColor Gray

try {
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $outputZip -CompressionLevel Optimal
    Write-Host "[OK] ZIP criado com sucesso!" -ForegroundColor Green
}
catch {
    Write-Host "[ERRO] Erro ao criar ZIP: $_" -ForegroundColor Red
    pause
    exit 1
}

# Limpar pasta temporária
Write-Host "[=>] Limpando arquivos temporarios..." -ForegroundColor Yellow
Remove-Item $tempFolder -Recurse -Force
Write-Host "[OK] Limpeza concluida" -ForegroundColor Green

# Informações do arquivo
$zipInfo = Get-Item $outputZip
$zipSizeMB = [math]::Round($zipInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  [SUCESSO] INSTALADOR GERADO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivo:" -ForegroundColor Cyan
Write-Host "   $outputZip" -ForegroundColor White
Write-Host ""
Write-Host "Tamanho:" -ForegroundColor Cyan
Write-Host "   $zipSizeMB MB" -ForegroundColor White
Write-Host ""
Write-Host "Conteudo:" -ForegroundColor Cyan
Write-Host "   [OK] Frontend compilado (dist/)" -ForegroundColor White
Write-Host "   [OK] Backend API (api/)" -ForegroundColor White
Write-Host "   [OK] Instalador Web (install/)" -ForegroundColor White
Write-Host "   [OK] Configuracao Apache (.htaccess)" -ForegroundColor White
Write-Host "   [OK] Documentacao (README.txt)" -ForegroundColor White
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse seu cPanel" -ForegroundColor White
Write-Host "   https://srv41.hinetworks.com.br:2083" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Vá em File Manager → public_html/" -ForegroundColor White
Write-Host ""
Write-Host "3. Faça upload do arquivo:" -ForegroundColor White
Write-Host "   rvcar-installer.zip" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Clique com botão direito → Extract" -ForegroundColor White
Write-Host ""
Write-Host "5. Acesse no navegador:" -ForegroundColor White
Write-Host "   https://seudominio.com.br/install/" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Siga os 4 passos do instalador" -ForegroundColor White
Write-Host ""
Write-Host "7. DELETE a pasta /install/ apos concluir!" -ForegroundColor Red
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Documentacao completa:" -ForegroundColor Cyan
Write-Host "  install/GUIA-INSTALADOR.md" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir a pasta..." -ForegroundColor Yellow
pause

# Abrir pasta onde está o ZIP
Invoke-Item $projectRoot

Write-Host ""
Write-Host "[SUCESSO] Pronto para deploy! Boa sorte!" -ForegroundColor Green
Write-Host ""