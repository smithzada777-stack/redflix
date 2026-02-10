# Script de Preparação para Deploy
# Execute este script para preparar o projeto para o primeiro commit

Write-Host "🚀 Preparando RedFlix para Deploy na Netlify..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
$currentPath = Get-Location
Write-Host "📁 Pasta atual: $currentPath" -ForegroundColor Yellow

# Verificar se git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git instalado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado! Instale em: https://git-scm.com/download/win" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Inicializar Git" -ForegroundColor White
Write-Host "   git init" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Adicionar arquivos" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Fazer commit" -ForegroundColor White
Write-Host "   git commit -m `"Deploy inicial na Netlify`"" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Criar repositório no GitHub" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣  Conectar ao GitHub (substitua SEU_USUARIO)" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/redflix.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""

# Perguntar se quer executar automaticamente
Write-Host "⚡ Quer executar os comandos 1-3 automaticamente? (S/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "🔧 Executando comandos..." -ForegroundColor Cyan
    
    # Verificar se já é um repositório git
    if (Test-Path ".git") {
        Write-Host "⚠️  Repositório Git já existe!" -ForegroundColor Yellow
        Write-Host "   Pulando 'git init'..." -ForegroundColor Gray
    } else {
        Write-Host "📦 Inicializando Git..." -ForegroundColor White
        git init
        Write-Host "✅ Git inicializado!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📦 Adicionando arquivos..." -ForegroundColor White
    git add .
    Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📦 Fazendo commit..." -ForegroundColor White
    git commit -m "Deploy inicial na Netlify"
    Write-Host "✅ Commit realizado!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 Pronto! Agora:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Crie um repositório no GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "2. Execute (substitua SEU_USUARIO):" -ForegroundColor White
    Write-Host ""
    Write-Host "   git remote add origin https://github.com/SEU_USUARIO/redflix.git" -ForegroundColor Yellow
    Write-Host "   git branch -M main" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "👍 Ok! Execute os comandos manualmente quando estiver pronto." -ForegroundColor White
    Write-Host ""
}

Write-Host "📚 Consulte os guias para mais detalhes:" -ForegroundColor Cyan
Write-Host "   - LEIA-ME-DEPLOY.md (índice)" -ForegroundColor Gray
Write-Host "   - DEPLOY-RAPIDO.md (comandos rápidos)" -ForegroundColor Gray
Write-Host "   - CHECKLIST-DEPLOY.md (acompanhar progresso)" -ForegroundColor Gray
Write-Host ""
