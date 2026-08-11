$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Banco de homologacao - IBO'
$form.Size = New-Object System.Drawing.Size(520, 235)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true

$label = New-Object System.Windows.Forms.Label
$label.Text = 'Cole a senha do banco definida no Supabase:'
$label.AutoSize = $true
$label.Location = New-Object System.Drawing.Point(24, 24)
$form.Controls.Add($label)

$passwordBox = New-Object System.Windows.Forms.TextBox
$passwordBox.Location = New-Object System.Drawing.Point(24, 55)
$passwordBox.Size = New-Object System.Drawing.Size(455, 28)
$passwordBox.UseSystemPasswordChar = $true
$form.Controls.Add($passwordBox)

$status = New-Object System.Windows.Forms.Label
$status.AutoSize = $true
$status.Location = New-Object System.Drawing.Point(24, 140)
$form.Controls.Add($status)

$saveButton = New-Object System.Windows.Forms.Button
$saveButton.Text = 'Salvar conexao'
$saveButton.Location = New-Object System.Drawing.Point(24, 100)
$saveButton.Size = New-Object System.Drawing.Size(140, 32)
$form.Controls.Add($saveButton)
$form.AcceptButton = $saveButton

$saveButton.Add_Click({
    try {
        if ([string]::IsNullOrWhiteSpace($passwordBox.Text)) {
            $status.ForeColor = [System.Drawing.Color]::DarkRed
            $status.Text = 'Cole a senha antes de salvar.'
            return
        }

        $envFile = Join-Path (Split-Path -Parent $PSScriptRoot) '.env.local'
        $encodedPassword = [Uri]::EscapeDataString($passwordBox.Text)
        $databaseUrl = "postgresql://postgres.nvjxhfdoxpcdraovgsuu:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
        $directUrl = "postgresql://postgres.nvjxhfdoxpcdraovgsuu:${encodedPassword}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

        $lines = Get-Content -LiteralPath $envFile
        $lines = $lines | ForEach-Object {
            if ($_ -match '^DATABASE_URL=') { "DATABASE_URL=`"$databaseUrl`"" }
            elseif ($_ -match '^DIRECT_URL=') { "DIRECT_URL=`"$directUrl`"" }
            else { $_ }
        }
        Set-Content -LiteralPath $envFile -Value $lines -Encoding utf8

        $passwordBox.Clear()
        $status.ForeColor = [System.Drawing.Color]::DarkGreen
        $status.Text = 'Conexao salva. Volte ao Codex e diga: configurado.'
        $saveButton.Enabled = $false
    }
    catch {
        $status.ForeColor = [System.Drawing.Color]::DarkRed
        $status.Text = 'Falha ao salvar. Informe ao Codex.'
    }
})

$form.Add_Shown({ $passwordBox.Focus() })
[void]$form.ShowDialog()
