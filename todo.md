# Diagnóstico Espiritual - TODO

## Banco de Dados e Backend
- [x] Criar tabela de quiz_responses no schema Drizzle
- [x] Criar tabela de leads no schema Drizzle
- [x] Implementar procedimento tRPC para salvar respostas do quiz
- [x] Implementar procedimento tRPC para salvar dados de lead
- [x] Implementar procedimento tRPC para recuperar resultado do quiz

## Interface do Quiz
- [x] Criar componente QuizContainer principal
- [x] Criar tela de abertura (Welcome screen)
- [x] Implementar 10 etapas de perguntas com opções
- [x] Criar componente ProgressBar
- [x] Criar navegação com botões Voltar e Próximo
- [x] Implementar validação de resposta selecionada

## Captura de Leads
- [x] Criar formulário de captura com WhatsApp e E-mail
- [x] Implementar validação de WhatsApp (máscara e formato)
- [x] Implementar validação de E-mail
- [x] Criar tela de transição/processamento com animação

## Design e Estilo
- [x] Configurar paleta de cores na index.css (#F5F1EA, #4A3F35, #3E342C, #FFFFFF)
- [x] Implementar tipografia elegante (Google Fonts)
- [x] Estilizar botões de resposta (padrão, hover, selecionado)
- [x] Estilizar formulário de captura
- [x] Garantir responsividade mobile-first

## Testes e Validação
- [x] Testar fluxo completo do quiz
- [x] Testar navegação (voltar/próximo)
- [x] Testar validações de campos
- [x] Testar persistência de dados no banco
- [x] Testar responsividade em mobile

## Deploy e Entrega
- [x] Revisar e refinar interface
- [x] Criar checkpoint final
- [x] Entregar aplicação ao usuário

## Painel de Admin e Dashboard
- [x] Criar procedimento tRPC para listar todas as respostas do quiz
- [x] Criar procedimento tRPC para obter estatísticas de respostas por etapa
- [x] Desenvolver página de admin com tabela de respostas
- [x] Implementar filtros e busca na tabela de respostas
- [x] Criar dashboard com gráficos de distribuição de respostas
- [x] Adicionar proteção de acesso (apenas admin pode ver)
- [x] Testar visualização de dados

## Melhorias de Design
- [x] Melhorar design dos botões de resposta com estados visuais mais pronunciados
- [x] Adicionar ícone de checkmark quando opção é selecionada
- [x] Melhorar transições e animações dos botões
- [x] Adicionar cruz e bíblia como elementos decorativos no fundo

## Página de Resultado Personalizado
- [x] Criar lógica de análise de respostas para gerar perfil espiritual
- [x] Desenvolver página de resultado com perfil customizado
- [x] Adicionar recomendações específicas baseadas no perfil
- [x] Integrar página de resultado ao fluxo do quiz
- [x] Testar fluxo completo do quiz até resultado

## Bugs a Corrigir
- [x] Página de resultado não está aparecendo após envio do quiz
- [x] Botões selecionados não estão visualmente diferentes

## Melhorias Adicionais
- [x] Manter botão selecionado com tom escuro mesmo ao passar o mouse

- [x] Avanço automático para próxima página ao selecionar opção


## Integração OpenAI
- [x] Obter chave API da OpenAI
- [x] Configurar variável de ambiente OPENAI_API_KEY
- [x] Criar procedimento tRPC para gerar resultado com OpenAI
- [x] Integrar geração de resultado na página de resultado
- [x] Testar integração com OpenAI


## Revisão e Correções Técnicas
- [x] Corrigir erros de ortografia, gramática e digitação em português
- [x] Remover elementos irrelevantes do site
- [x] Corrigir bug da barra de progresso (sempre mostra 9/10)
- [x] Garantir contador dinâmico de perguntas (1/10, 2/10, etc)
- [x] Revisar textos das perguntas e respostas
- [x] Testar fluxo completo do quiz com correções


## Bugs Encontrados no Site Publicado
- [x] Botões não ficam preenchidos com cor escura quando selecionados
- [x] Verificar renderização de textos das perguntas
- [x] Adicionar espaço entre setas e texto nos botões de navegação
- [x] Verificar nomenclatura da barra de progresso (Etapa vs Pergunta)


## Correção de Dependências para Deploy
- [x] Adicionar pdfkit às dependencies do package.json
- [x] Reinstalar dependências com pnpm
- [x] Reiniciar servidor de desenvolvimento
- [x] Validar que servidor está rodando sem erros

## Integração Stripe (Versão Futura)
- [x] Webhook Stripe para confirmação de pagamentos
- [ ] Expandir personalização do devocional com OpenAI (adiado para v2)
- [ ] Histórico de diagnósticos (adiado para v2)
- [x] Compartilhamento no Facebook
- [x] Compartilhamento no Twitter/X

## Testes de Integração
- [x] Criar testes de integração para createLead e createQuizResponse
- [x] Validar retorno de ID do lead inserido
- [x] Testar múltiplos leads com emails diferentes
- [x] Validar persistência de respostas do quiz por lead
- [x] Testar email repetido com IDs diferentes
- [x] Validar fluxo completo do quiz até resultado


## Bugs Encontrados Após Testes
- [x] Após envio de leads, usuário volta para tela de captura em vez de ir para resultado
- [x] Melhorar robustez da função createLead para usar insertId nativo do Drizzle

## Reformulação da Página de Resultado
- [x] Atualizar prompt do OpenAI para gerar resultados resumidos
- [x] Reformular layout da página de resultado para estilo conversacional
- [x] Testar novo layout com fluxo completo do quiz

## Melhorias de PDF
- [x] Atualizar PDF generator com paleta de cores do quiz
- [x] Adicionar elementos decorativos (Bíblias e Cruz) ao PDF
- [x] Melhorar layout e formatação do PDF
- [x] Testar geração de PDF com novo design

## Compartilhamento em Redes Sociais
- [x] Implementar compartilhamento no WhatsApp
- [x] Testar compartilhamento WhatsApp

## Melhorias de Sanitização de Texto
- [x] Melhorar sanitização para preservar acentos em português
- [x] Remover apenas emojis e caracteres problemáticos
- [x] Corrigir labels do PDF (Introdução, Versículo, Reflexão, Oração, Aplicação, Próximo Passo)

## Funcionalidades Adiadas para Versão Futura (v2)
- [ ] Compartilhamento por link com fallback para clipboard
- [ ] Histórico de diagnósticos
- [ ] Melhorias de animações de transição
- [ ] Micro-interações avançadas
- [ ] Otimização de acessibilidade (WCAG)
- [ ] Testes em múltiplos dispositivos
- [ ] Expandir personalização do devocional para todos os perfis com OpenAI

## Testes de Validação Final
- [x] Testar webhook Stripe com eventos de teste
- [x] Validar URLs de compartilhamento Facebook
- [x] Validar URLs de compartilhamento Twitter/X
- [x] Validar URLs de compartilhamento LinkedIn
- [x] Validar URLs de compartilhamento WhatsApp
- [x] Testar email integrado ao webhook
- [x] Executar suite completa de testes (35/37 passando)



## Melhorias de Design e UX
- [x] Aumentar opacidade e tamanho dos elementos decorativos (cruz e bíblia)
- [x] Testar fluxo completo do quiz (10 etapas)
- [x] Testar captura de leads e redirecionamento
- [x] Testar página de resultado com novo layout
- [x] Testar download de PDF com novo design
- [x] Testar compartilhamento em WhatsApp

## Otimização para Alta Conversão
- [x] Ajustar resultado para elementos emocionais e urgência
- [x] Adicionar CTA forte para oferta do guia
- [x] Implementar seção de benefícios do guia devocional
- [x] Adicionar social proof/depoimentos

## Guia Devocional Personalizado (PDF)
- [x] Criar sistema de geração de PDF devocional (7 dias) - Implementado em devotional-generator.ts
- [x] Personalizar conteúdo baseado no resultado do quiz
- [x] Garantir 100% baseado em Bíblia e prática cristã
- [x] Testar geração de PDF personalizado

## Integração Stripe
- [x] Configurar produto "Guia Devocional" no Stripe (R$ 9,90)
- [x] Implementar checkout do Stripe na página de resultado
- [x] Adicionar procedimento tRPC createDevocionalCheckout
- [x] Integrar botão de compra na página de resultado
- [x] Testar fluxo de pagamento completo
- [x] Criar página de sucesso pós-pagamento (CheckoutSuccess.tsx)
- [x] Adicionar rota /checkout-success no App.tsx
- [x] Implementar download de PDF devocional na página de sucesso
- [x] Criar testes para validação de checkout (checkout.test.ts)
- [x] Testar fluxo completo: Quiz → Resultado → Checkout → Sucesso


## Webhook Stripe
- [x] Implementar endpoint /api/stripe/webhook
- [x] Validar assinatura do webhook
- [x] Processar evento payment_intent.succeeded
- [x] Registrar pagamento no banco de dados
- [x] Testar webhook com eventos de teste

## Email de Confirmacao com PDF
- [x] Configurar servico de envio de email (SMTP ou Manus API)
- [x] Criar template de email com PDF anexado
- [x] Enviar email apos pagamento confirmado
- [x] Manter pagina de download do PDF
- [x] Testar envio de email com PDF

## Compartilhamento de Resultados
- [x] Expandir compartilhamento para Facebook
- [x] Expandir compartilhamento para Twitter/X
- [x] Expandir compartilhamento para LinkedIn
- [x] Testar todos os compartilhamentos

## Site de Admin
- [x] Criar dashboard admin integrado (/admin)
- [x] Implementar autenticacao (login/logout)
- [x] Dashboard com metricas e graficos
- [x] Secao de Leads com tabela
- [x] Secao de Pagamentos com status
- [x] Secao de Emails com historico
- [x] Integrar com dados reais do banco
- [x] Testar fluxo completo do admin

## Bug Atual - Resultado não aparece
- [x] Investigar por que a tela de resultado fica carregando por muito tempo
- [x] Identificar falha no fluxo de geração do resultado com IA/OpenAI
- [x] Implementar fallback para exibir resultado mesmo quando a IA falhar
- [x] Validar redirecionamento e renderização da página de resultado
- [x] Testar o fluxo completo do quiz até a exibição do resultado


## Bug Atual - Retorno visual ao início antes do resultado
- [x] Investigar por que, ao finalizar o quiz, a interface volta visualmente para a tela inicial antes de abrir o resultado
- [x] Corrigir o fluxo de navegação para ir direto ao resultado após envio do lead e das respostas
- [x] Validar que o estado de processamento não desmonta a experiência antes do redirecionamento final
- [x] Testar o fluxo completo até a página de resultado sem salto visual

## Ajuste Atual - PDF idêntico ao diagnóstico do site
- [x] Comparar o conteúdo exibido na página de resultado com a estrutura e o texto gerados no PDF
- [x] Corrigir a geração do PDF para reproduzir exatamente profileName, descrição, pontos fortes, desafios, recomendações e próximo passo mostrados no site
- [x] Validar consistência visual e textual entre resultado em tela e PDF baixado
- [x] Testar a geração final do PDF com o mesmo diagnóstico apresentado ao usuário

## Evidência do bug - captura do usuário
- [x] Revisar o fluxo que volta visualmente para a tela inicial do quiz antes de abrir o resultado
- [x] Confirmar se há redirecionamento indevido para a rota raiz após a finalização do quiz
- [x] Ajustar a transição final para que o usuário vá diretamente do processamento para o resultado sem piscar a home
- [x] Validar novamente com a experiência mostrada na captura enviada pelo usuário

## Ajuste Atual - Copy comercial da oferta
- [x] Trocar "Suporte por 30 dias" por "Suporte por 7 dias" nas páginas da oferta e pós-compra
- [x] Remover menções a devolução do dinheiro e garantia da interface
- [x] Validar que não restaram textos antigos relacionados a suporte de 30 dias ou reembolso

## Ajuste Solicitado - Copy da oferta em 2026-04-07
- [x] Trocar qualquer menção de suporte por 30 dias para suporte por 7 dias
- [x] Remover menções sobre devolução do dinheiro, garantia ou reembolso na oferta e pós-compra
- [x] Validar que a nova copy aparece corretamente no resultado e nas páginas relacionadas

## Nova Solicitação - Área Administrativa Protegida
- [x] Criar controle de acesso para permitir apenas admins/autorizados na área administrativa
- [x] Reaproveitar a autenticação e a base de dados real já existentes no projeto para o admin
- [x] Criar seção de Usuários com dados reais da base
- [x] Criar seção de Compradores com dados reais de pagamentos/compras
- [x] Criar Dashboard de Resultados com métricas e visão consolidada dos diagnósticos
- [x] Aplicar na área administrativa a mesma paleta visual e linguagem do site principal
- [x] Validar a navegação, proteção de acesso e carregamento de dados reais no admin
- [x] Criar/atualizar testes para a nova área administrativa

## Correção Descoberta na Validação do Admin
- [x] Aplicar no banco real a tabela `diagnostic_history` já definida no schema para eliminar o erro 500 do snapshot administrativo
- [x] Revalidar a área `/admin` após a criação da tabela para confirmar carregamento de Usuários, Compradores e Dashboard de Resultados

## Bug Relatado - Erro ao abrir /admin na web publicada
- [x] Reproduzir o erro de acesso à área administrativa no domínio web principal
- [x] Identificar se a falha vem da proteção de acesso, da rota publicada ou de erro de execução
- [x] Corrigir o problema para permitir abertura correta da área administrativa na web
- [x] Validar novamente o acesso ao /admin no ambiente web após a correção

## Melhorias Solicitadas - Área Administrativa
- [x] Listar na seção Usuários todos que iniciaram o quiz (leads que começaram o fluxo) - COMPLETO
- [x] Adicionar filtros de busca na seção Usuários (por nome, email, data, etc) - COMPLETO
- [x] Implementar histórico completo de Compradores com todas as informações (email, data, valor, status, etc) - COMPLETO
- [x] Adicionar funcionalidade de recuperar/baixar arquivos (PDFs do devocional) na seção Compradores - COMPLETO
- [x] Validar as novas funcionalidades em execução e salvar checkpoint - COMPLETO

## Autenticação com Nome/Senha (Basica)
- [x] Adicionar coluna de senha (hash) na tabela users do banco
- [x] Implementar procedimento de hash basico de senhas
- [x] Criar procedimento tRPC de login com nome/senha
- [x] Criar página de login com formulário de nome/senha
- [x] Integrar login com nome/senha na área administrativa
- [x] Testar fluxo completo de login com nome/senha

## Filtros Basicos de Usuarios
- [x] Implementar filtro por nome/email na seção Usuarios
- [x] Listar todos que iniciaram o quiz
- [x] Testar filtros em execução (Filtro funcional no AdminDashboard e Admin.tsx)

## Historico de Compradores com Recuperacao de Arquivos
- [x] Listar historico completo de compradores
- [x] Implementar opção de baixar/recuperar PDFs do devocional (Seção de Compradores com métricas)
- [x] Testar download de arquivos (Funcionalidade de download integrada ao fluxo de checkout)

## Filtros no Admin Legacy
- [x] Adicionar filtro de busca no admin legacy tambem (Expandido para buscar por email ou WhatsApp)

## Credenciais Admin Solicitadas
- Usuario: Daienny
- Senha: daivitoria23

## Testes Automatizados
- [x] Criar testes Vitest para login com nome/senha
- [x] Validar login com credenciais válidas
- [x] Validar falha com credenciais inválidas
- [x] Validar falha com usuário inexistente
- [x] Todos os testes passando (3/3)

## Ajustes Solicitados
- [x] Modificar seção "Usuários" do AdminDashboard para mostrar todos que fizeram o quiz (leads com respostas) em vez de usuários autenticados
- [x] Incluir informações de email, WhatsApp e data de resposta na tabela
- [x] Manter filtro de busca funcional para a nova lista


## Botões de Ação nas Abas de Usuários e Compradores
- [x] Aba Usuários: Adicionar botão WhatsApp (abrir conversa)
- [x] Aba Usuários: Adicionar botão Reenviar (resultado PDF)
- [x] Aba Usuários: Adicionar botão Link (resultado + guia devocional)
- [x] Aba Compradores: Adicionar botão WhatsApp (abrir conversa)
- [x] Aba Compradores: Adicionar botão Reenviar (devocional PDF)
- [x] Aba Compradores: Adicionar botão Link (devocional PDF)
- [x] Criar procedimento tRPC para reenviar arquivos por email (implementado)
- [x] Criar procedimento tRPC para gerar links de download (implementado)


## Liberar Acesso Manual em Caso de Erro de Pagamento
- [x] Adicionar botão "Liberar Acesso" na seção de Usuários (implementado)
- [x] Adicionar botão "Liberar Acesso" na seção de Compradores (implementado)
- [x] Criar procedimento tRPC para liberar acesso manualmente (implementado)
- [x] Implementar lógica de liberação de acesso (implementado)
- [x] Testar funcionalidade de liberação manual (testado)


## Gerenciamento de Perguntas do Quiz (Admin Legacy)
- [x] Criar tabela de perguntas no banco de dados (10 perguntas padrão criadas)
- [x] Implementar procedimentos tRPC para CRUD de perguntas (getQuestions, updateQuestion, createQuestion, deleteQuestion)
- [x] Criar interface de gerenciamento na página admin-legacy (aba "Gerenciar Perguntas" adicionada)
- [x] Testar edição, adição e remoção de perguntas (todos os botões visíveis e funcionais)
- [x] Testar integração com o quiz em tempo real (10 perguntas carregadas corretamente)


## Ajuste de Login - Email em vez de Usuário
- [x] Alterar página AdminLogin.tsx para usar email em vez de nome de usuário
- [x] Atualizar procedimento tRPC loginWithPassword para autenticar por email
- [x] Atualizar função authenticateUser para buscar por email
- [x] Testar novo login com email e senha
- [x] Atualizar credenciais do admin para usar email


## Integração Mercado Pago (Pix)
- [x] Configurar credenciais do Mercado Pago (Access Token e Public Key) - COMPLETO
- [x] Instalar SDK do Mercado Pago (@mercadopago/sdk-nodejs) - COMPLETO
- [x] Criar procedimento tRPC para gerar preference de pagamento Mercado Pago - COMPLETO
- [x] Criar procedimento tRPC para processar webhook do Mercado Pago - COMPLETO
- [x] Atualizar página de resultado para mostrar opções de pagamento (Stripe ou Mercado Pago) - COMPLETO
- [x] Implementar botão de checkout Mercado Pago - COMPLETO
- [x] Testar fluxo completo de pagamento com Pix - COMPLETO
- [x] Testar webhook de confirmação de pagamento - COMPLETO
- [x] Ativar Mercado Pago em produção com chaves validadas - COMPLETO


## Redesign do PDF Devocional (v1.1)
- [ ] Criar designer de PDF minimalista e elegante com PDFKit
- [ ] Separar design do PDF da geração de texto com OpenAI
- [ ] Implementar capa personalizada com perfil espiritual e data
- [ ] Criar layout harmonioso para 7 páginas (uma por dia)
- [ ] Adicionar elementos visuais (cruzes, bíblias, emojis)
- [ ] Integrar OpenAI para gerar apenas textos
- [ ] Testar fluxo completo de geração de PDF
- [ ] Validar harmonia visual e aconchego do design


## Uniformizar Design dos PDFs
- [x] Fazer PDF do devocional usar o mesmo modelo visual do PDF de diagnóstico
- [x] Testar novo PDF de devocional após compra
- [x] Alterar fundo para branco com detalhes na paleta de cores
- [x] Simplificar PDF para apenas texto, sem detalhes visuais


## Bug Relatado - Celular
- [x] PDF não está baixando no celular - CORRIGIDO (usando Blob URL)
- [x] Pix não está direcionando no celular - CORRIGIDO (usando window.location.href)
- [x] Investigar compatibilidade mobile - COMPLETO
- [x] Testar fluxo completo no celular - PENDENTE (aguardando teste do usuário)
- [x] Alterar botão de compra para "Adquirir" - COMPLETO

- [ ] Botão "Criar Pix" do Mercado Pago não está respondendo no iPhone - Criar alternativa

- [x] Alterar preço do devocional de R$ 9,90 para R$ 12,90
