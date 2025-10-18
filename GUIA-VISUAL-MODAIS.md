# 🎨 Sistema de Modais - Guia Visual

## 🔄 Fluxo de Navegação

```
┌─────────────────────────────────────────┐
│                                         │
│         Botão "Fale com Consultor"     │
│              (Hero Section)             │
│                                         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     🚗 Modal de Seleção de Serviço     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   🚗 Alugar um Veículo           │ │
│  │   Veículos prontos para apps     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   💰 Investir em Frota           │ │
│  │   Transforme carro em renda      │ │
│  └───────────────────────────────────┘ │
│                                         │
└────────┬────────────────────┬───────────┘
         │                    │
         ▼                    ▼
┌────────────────┐    ┌────────────────┐
│  ALUGUEL       │    │  INVESTIMENTO  │
└────────────────┘    └────────────────┘
```

## 📋 Modal de Aluguel

```
╔═══════════════════════════════════════════╗
║          [LOGO RV CAR]                    ║
║                                           ║
║      Aluguel de Veículos                  ║
║   Preencha seus dados e escolha           ║
║      o veículo ideal para você            ║
╠═══════════════════════════════════════════╣ ← Cabeçalho Fixo
║                                           ║
║  Nome Completo *                          ║
║  ┌─────────────────────────────────────┐ ║
║  │ Digite seu nome completo            │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Telefone *                               ║
║  ┌─────────────────────────────────────┐ ║
║  │ (47) 98448-5492                     │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  E-mail *                                 ║
║  ┌─────────────────────────────────────┐ ║
║  │ seu@email.com                       │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║ ← Área Rolável
║  Veículo Desejado *                       ║
║  ┌─────────────────────────────────────┐ ║
║  │ Selecione um veículo           ▼   │ ║
║  └─────────────────────────────────────┘ ║
║  • Fiat Mobi - R$650                      ║
║  • Renault Kwid - R$650                   ║
║  • Fiat Uno - R$650                       ║
║  • Chevrolet Onix - R$700                 ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │  💬 Falar com um Consultor          │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╚═══════════════════════════════════════════╝
```

## 💰 Modal de Investimento

```
╔═══════════════════════════════════════════╗
║          [LOGO RV CAR]                    ║
║                                           ║
║      Investimento em Frota                ║
║   Transforme seu veículo em uma           ║
║      fonte de renda passiva               ║
╠═══════════════════════════════════════════╣ ← Cabeçalho Fixo
║                                           ║
║  Nome Completo *                          ║
║  ┌─────────────────────────────────────┐ ║
║  │ Digite seu nome completo            │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Telefone *                               ║
║  ┌─────────────────────────────────────┐ ║
║  │ (47) 98448-5492                     │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  E-mail *                                 ║
║  ┌─────────────────────────────────────┐ ║ ← Área Rolável
║  │ seu@email.com                       │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ─────────────────────────────────────── ║
║       Informações do Veículo              ║
║                                           ║
║  Marca *                                  ║
║  ┌─────────────────────────────────────┐ ║
║  │ Ex: Chevrolet, Fiat, Volkswagen     │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Modelo *                                 ║
║  ┌─────────────────────────────────────┐ ║
║  │ Ex: Onix, Mobi, Gol                 │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Ano *                                    ║
║  ┌─────────────────────────────────────┐ ║
║  │ Ex: 2020                            │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │  💬 Falar com um Consultor          │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╚═══════════════════════════════════════════╝
```

## 📱 Mensagem WhatsApp - Aluguel

```
🚗 *Solicitação de Aluguel - RV Car*

👤 *Nome:* João da Silva
📱 *Telefone:* (47) 98448-5492
📧 *E-mail:* joao@email.com
🚙 *Veículo Desejado:* Fiat Mobi

_Mensagem enviada através do site RV Car_
```

## 📱 Mensagem WhatsApp - Investimento

```
💰 *Proposta de Investimento - RV Car*

👤 *Nome:* Maria Santos
📱 *Telefone:* (47) 98765-4321
📧 *E-mail:* maria@email.com

🚗 *Dados do Veículo:*
• *Marca:* Chevrolet
• *Modelo:* Onix
• *Ano:* 2020

_Tenho interesse em transformar meu veículo em renda passiva através da locação._

_Mensagem enviada através do site RV Car_
```

## 🎯 Estados de Interação

### Loading - Carregando Veículos

```
┌─────────────────────────────────┐
│  Veículo Desejado *             │
│                                 │
│      ⏳ Carregando veículos...  │
│                                 │
└─────────────────────────────────┘
```

### Loading - Enviando Formulário

```
┌─────────────────────────────────┐
│  ⏳ Enviando...                 │
└─────────────────────────────────┘
```

### Sem Veículos Disponíveis

```
┌─────────────────────────────────┐
│  Veículo Desejado *             │
│                                 │
│  Nenhum veículo disponível      │
│  no momento.                    │
│  Entre em contato para mais     │
│  informações.                   │
│                                 │
└─────────────────────────────────┘
```

## 🎨 Paleta de Cores

```
┌────────────────────────────────────┐
│  Primary (Amarelo):  #FFD700       │
│  Background:         #FFFFFF       │
│  Border:            #E5E7EB       │
│  Text Primary:      #1F2937       │
│  Text Secondary:    #6B7280       │
│  Success:           #10B981       │
│  Error:             #EF4444       │
└────────────────────────────────────┘
```

## 📐 Responsividade

### Desktop (≥ 640px)

- Largura máxima: 32rem (512px)
- Altura máxima: 90vh
- Padding interno: 1.5rem

### Mobile (< 640px)

- Largura: 95% da tela
- Altura máxima: 90vh
- Padding interno: 1rem
- Font-size reduzido

## ✅ Indicadores Visuais

```
Campo Obrigatório:     Nome Completo *
Campo com Erro:        Nome Completo * ⚠️
Campo Válido:          Nome Completo * ✓
Loading:               ⏳
Sucesso:               ✓
Erro:                  ✗
```

## 🔔 Notificações (Toast)

### Sucesso

```
┌─────────────────────────────────┐
│ ✓ Sucesso!                      │
│ Você será redirecionado para    │
│ o WhatsApp.                     │
└─────────────────────────────────┘
```

### Erro - Campos Vazios

```
┌─────────────────────────────────┐
│ ✗ Campos obrigatórios           │
│ Por favor, preencha todos os    │
│ campos.                         │
└─────────────────────────────────┘
```

### Erro - Ano Inválido

```
┌─────────────────────────────────┐
│ ✗ Ano inválido                  │
│ Por favor, insira um ano entre  │
│ 1900 e 2026.                    │
└─────────────────────────────────┘
```

### Erro - Carregar Veículos

```
┌─────────────────────────────────┐
│ ✗ Erro                          │
│ Não foi possível carregar os    │
│ veículos disponíveis.           │
└─────────────────────────────────┘
```

## 🎬 Animações

- **Abertura do Modal**: Fade in + Scale (200ms)
- **Fechamento do Modal**: Fade out + Scale (200ms)
- **Hover nos Botões**: Background color transition (150ms)
- **Loading**: Spin animation contínua
- **Toast**: Slide in from top (300ms)

---

📅 **Criado em**: 18/10/2025  
🎨 **Designer**: Sistema de Modais RV Car  
✅ **Status**: Implementado
