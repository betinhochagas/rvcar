@echo off
REM Script para sincronizar imagens entre uploads e public
echo Sincronizando imagens...

if not exist "public\uploads\vehicles" (
    mkdir "public\uploads\vehicles"
)

xcopy "uploads\vehicles\*.*" "public\uploads\vehicles\" /Y /Q

echo Imagens sincronizadas com sucesso!
