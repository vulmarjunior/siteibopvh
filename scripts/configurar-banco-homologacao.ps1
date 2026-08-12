$ErrorActionPreference = 'Stop'

$envFile = Join-Path (Split-Path -Parent $PSScriptRoot) '.env.local'
if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Arquivo .env.local nao encontrado."
}

Write-Host ''
Write-Host 'Configuracao segura do banco de homologacao' -ForegroundColor Cyan
Write-Host 'Digite a senha que voce acabou de definir no Supabase.'
$securePassword = Read-Host 'Senha do banco' -AsSecureString

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    if ([string]::IsNullOrWhiteSpace($plainPassword)) {
        throw 'A senha nao pode ficar vazia.'
    }

    $encodedPassword = [Uri]::EscapeDataString($plainPassword)
    $databaseUrl = "postgresql://postgres.nvjxhfdoxpcdraovgsuu:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    $directUrl = "postgresql://postgres.nvjxhfdoxpcdraovgsuu:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

    $lines = Get-Content -LiteralPath $envFile
    $lines = $lines | ForEach-Object {
        if ($_ -match '^DATABASE_URL=') { "DATABASE_URL=`"$databaseUrl`"" }
        elseif ($_ -match '^DIRECT_URL=') { "DIRECT_URL=`"$directUrl`"" }
        else { $_ }
    }
    Set-Content -LiteralPath $envFile -Value $lines -Encoding utf8
    Write-Host ''
    Write-Host 'Conexao salva no .env.local com sucesso.' -ForegroundColor Green
    Write-Host 'Volte ao Codex e diga: configurado.'
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    $plainPassword = $null
    $encodedPassword = $null
}
