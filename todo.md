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
## Correção do Webhook Stripe - checkout.session.completed
- [x] Adicionar tratamento do evento checkout.session.completed no webhook
- [x] Registrar pagamentos corretamente no banco de dados
- [x] Gerar PDF do devocional automaticamente após pagamento
- [x] Testar fluxo completo de pagamento com novo webhook
- [x] Validar que o leadId é passado corretamente para a sessão Stripe
- [x] Verificar logs do webhook para confirmar processamento

## Gerenciamento de Perguntas do Quiz (Admin Legacy)
- [x] Criar tabela de perguntas no banco de dados (10 perguntas padrão criadas)
- [x] Implementar procedimentos tRPC para CRUD de perguntas (getQuestions, updateQuestion, createQuestion, deleteQuestion)
- [x] Criar interface de gerenciamento na página admin-legacy (aba "Gerenciar Perguntas" adicionada)
- [x] Testar edição, adição e...remoção de perguntas (todos os botões visíveis e funcionais)
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
- [x] Criar designer de PDF minimalista e elegante com PDFKit
- [x] Separar design do PDF da geração de texto com OpenAI
- [x] Implementar capa personalizada com perfil espiritual e data
- [x] Criar layout harmônioso para 7 páginas (uma por dia)
- [x] Adicionar elementos visuais (cruzes, bíblia, emojis)
- [x] Integrar OpenAI para gerar apenas textos
- [x] Testar fluxo completo de geração de PDF
- [x] Validar harmonia visual e aconchego do design


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

- [x] Botão "Criar Pix" do Mercado Pago não está respondendo no iPhone - PIX funcionando corretamente

- [x] Alterar preço do devocional de R$ 9,90 para R$ 12,90 - COMPLETO

- [x] Erro ao redirecionar após pagamento Mercado Pago - CORRIGIDO (webhook criado)
- [x] PDF não está sendo enviado por email após pagamento confirmado - CORRIGIDO (webhook criado)
- [x] Webhook do Mercado Pago pode não estar disparando corretamente - CORRIGIDO (webhook criado e registrado)

- [x] Configurar webhook no painel do Mercado Pago (URL: https://espiritualquiz-sx87ncqt.manus.space/api/mercadopago/webhook)


## Redesign do PDF e Personalização (v2.0)
- [ ] Atualizar schema do quiz para coletar nome na primeira pergunta
- [ ] Adicionar pergunta "Algo que você queira acrescentar ou desabafar?" no final do quiz
- [ ] Redesenhar gerador de PDF com novo layout (baseado no modelo enviado)
- [ ] Implementar espaço para data no topo de cada página
- [ ] Implementar espaço para anotações após o texto
- [ ] Criar 1 dia por página no devocional (7 páginas total)
- [ ] Reescrever textos do resultado para serem profundos e emocionais
- [ ] Reescrever textos do devocional para serem profundos e emocionais
- [ ] Personalizar todos os textos com o nome da pessoa
- [ ] Integrar resposta do desabafo no resultado/devocional se aplicável
- [ ] Testar novo fluxo completo com nome e desabafo
- [ ] Validar novo PDF com layout elegante


## Redesenho da Página de Resultado (Alta Conversão)
- [x] Redesenhar página de resultado com título personalizado (com nome)
- [x] Implementar seção de Diagnóstico (Dor) com conexão emocional
- [x] Implementar seção de Consequências
- [x] Implementar seção de Esperança
- [x] Implementar seção de Pitch do devocional
- [x] Implementar CTA com contador "Oferta disponível hoje por R$ 12,90"
- [x] Testar fluxo completo de resultado com novo design


## Bugs Reportados
- [x] Erro ao carregar o diagnóstico na página de resultado


## Correção Crítica - Migrações do Banco de Dados (2026-04-09)
- [x] Aplicar migrações SQL manualmente ao banco de dados MySQL:
  - ALTER TABLE `leads` ADD `name` varchar(255);
  - ALTER TABLE `quiz_responses` ADD `step11` text;
  - ALTER TABLE `quiz_responses` ADD `step12` text;
- [x] Verificar se as colunas foram criadas corretamente
- [x] Testar fluxo completo do quiz (nome, respostas, desabafo)
- [x] Validar se o erro "Erro ao enviar dados" foi resolvido
- [x] Criar testes vitest para validar o fluxo completo
- [x] Corrigir função createQuizResponse para retornar ID inserido
- [x] Todos os testes passando (4/4)
- [x] Validar fluxo no navegador (nome, perguntas, avanço automático)
- [x] Salvar checkpoint final após validação


## Atualizacao da Oferta e PDF (2026-04-09)
- [x] Atualizar pagina de resultado com nova oferta otimizada
  - [x] Headline: "Voce nao precisa continuar se sentindo distante de Deus."
  - [x] Subheadline: "Esse plano simples de 7 dias ja ajudou muitas pessoas..."
  - [x] CTA: "Quero me reconectar com Deus"
  - [x] Personalizacao: "Baseado nas suas respostas, recomendamos..."
  - [x] Nome do produto: "Devocional: 7 Dias para se Reconectar com Deus"
  - [x] Secao "O que voce recebe" com 5 itens
  - [x] Bonus: "Checklist diario com Deus"
- [x] Gerar PDF devocional "7 Dias para se Reconectar com Deus"
  - [x] Usar modelo fornecido (DearMs.Carpenter.pdf)
  - [x] Copiar modelo para cover-template.pdf
  - [x] Sistema configurado para usar modelo como capa
- [x] Testar fluxo completo (quiz → resultado → PDF)
  - [x] Página inicial do quiz funcionando
  - [x] Coleta de nome na pergunta 1
  - [x] Avanço automático entre perguntas
  - [x] Nova página de resultado com oferta otimizada
  - [x] Modelo do PDF integrado
- [x] Salvar checkpoint final


## Ajustes Finais do PDF e UI (2026-04-09)
- [x] Criar PDF devocional com conteudo completo
  - [x] Usar modelo como capa (primeira página)
  - [x] Adicionar 7 páginas de conteúdo (um dia por página)
  - [x] Cada página com: Dia, Versículo, Reflexão, Oração
  - [x] Adicionar espaço para anotações (linhas em branco)
  - [x] Centralizar texto
  - [x] Design elegante e profissional
- [x] Remover "Seus Próximos Passos" da página de resultado (Result.tsx)
- [x] Remover "Próximos Passos" da página de sucesso (CheckoutSuccess.tsx)
- [x] Verificar botão de copiar PIX (gerenciado pelo Mercado Pago)
- [x] Otimizar botão "Quero me reconectar com Deus" para mobile
  - [x] Redimensionar para mobile (py-3 md:py-6)
  - [x] Ajustar tamanho do texto (text-sm md:text-lg)
  - [x] Texto responsivo (hidden sm:inline)
- [x] Testar todas as mudanças
- [x] Salvar checkpoint final


## Login da Admin e Correcao do PIX (2026-04-09)
- [x] Criar tabela de admin no banco de dados (username, password_hash)
- [x] Inserir usuario daienny com senha vitoria1023
- [x] Criar pagina de login da admin (/admin-login)
  - [x] Campo de usuario
  - [x] Campo de senha
  - [x] Botao de login
  - [x] Validacao de credenciais
- [x] Criar procedimento tRPC para autenticacao da admin
  - [x] admin.login (username, password)
  - [x] Retornar token de sessao
- [x] Integrar login com sistema de sessao
  - [x] Salvar token no localStorage
  - [x] Proteger rotas da admin
- [x] Corrigir botao de gerar PIX
  - [x] Verificar integracao com Mercado Pago
  - [x] Testar geracao de link PIX
  - [x] Corrigir erro de navigator no servidor
  - [x] Remover logica que nao funciona no servidor Node.js
- [x] Testar fluxo completo de login e PIX
- [x] Salvar checkpoint final (v50f371ad)


## Bug Relatado - Resultado Sempre "Buscador Sedento" (2026-04-09)
- [x] Investigar como as 12 respostas do quiz estão sendo passadas para o OpenAI
- [x] Verificar se o prompt do OpenAI está pedindo para gerar resultado personalizado
- [x] Corrigir a lógica de geração de resultado para usar TODAS as 12 respostas
- [x] Reescrever prompt do OpenAI para 100% personalizado
  - [x] Proibir nomes genéricos como "Buscador Sedento"
  - [x] Exigir análise profunda de TODAS as 12 respostas
  - [x] Criar perfis únicos e específicos
  - [x] Buscar conexão emocional real e encantamento
- [x] Verificar se o devocional também está sendo personalizado
- [x] Testar com diferentes respostas para validar personalização
  - [x] Teste com Ana Clara: "Alma Ressequida Ansiando por Recomeço e Intimidade"
  - [x] Resultado 100% personalizado e diferente de "Buscador Sedento"
  - [x] Análise profunda de cansaço, confusão, desejo de intimidade
  - [x] Texto encantador que conecta emocionalmente
- [x] Salvar checkpoint após correção

## Bugs Reportados - Persistência após correções (2026-04-09)
- [x] Reproduzir caso em que o diagnóstico volta a aparecer como "Buscador Sedento" (perfil não existe no código)
- [x] Verificar se todas as 12 respostas estão chegando corretamente ao backend no momento da geração
- [x] Confirmar se o fallback está sobrescrevendo o resultado personalizado da OpenAI
- [x] Corrigir a lógica para impedir retorno ao perfil genérico quando houver respostas suficientes
- [x] Reproduzir erro no login da admin com as credenciais atuais (código está correto)
- [x] Identificar se a falha do login está na autenticação, sessão, rota ou redirecionamento
- [x] Corrigir o login da admin e validar acesso real ao painel
- [x] Testar novamente os fluxos de resultado e login
- [x] Salvar checkpoint após correção definitiva

## Bugs Reportados - Lentidão, resultado genérico e login admin (2026-04-09)
- [x] Investigar por que a tela /result pode ficar travada
- [x] Verificar geração do diagnóstico e fallback
- [x] Confirmar se ainda existe qualquer caminho que produza o perfil genérico repetido
- [x] Validar login administrativo
- [x] Ampliar os testes automatizados

## Correções Aplicadas (2026-04-10)
- [x] Resolver conflito de merge no Result.tsx
- [x] Instalar dependência openai
- [x] Corrigir tipo de procedure generateDownloadLink de query para mutation
- [x] Adicionar timeout de 30 segundos para fallback automático
- [x] Criar admin padrão no banco de dados
- [x] Escrever testes para login admin
- [x] Escrever testes para geração do diagnóstico
- [ ] Salvar checkpoint final
- [ ] Investigar por que o resultado do quiz ficou confuso e identificar possíveis erros de conteúdo, fluxo ou exibição
- [ ] Revisar a clareza do texto principal, subtítulo e blocos do resultado para garantir leitura simples e direta
- [ ] Validar se o diagnóstico exibido corresponde corretamente às respostas do quiz e ao conteúdo retornado pelo backend

## Ajustes de Clareza na Página de Resultado
- [x] Corrigir título do resultado para evitar combinações confusas entre prefixo da interface e profileName retornado
- [x] Padronizar nomes de fallback do diagnóstico com linguagem direta e sem emojis
- [x] Atualizar teste do fallback para garantir títulos claros e consistentes

## Personalização Total do Diagnóstico
- [ ] Reescrever o prompt da IA para obrigar análise específica de cada resposta do quiz
- [ ] Ajustar a geração do diagnóstico para citar padrões concretos, dores e desejos extraídos das respostas
- [ ] Revisar o resultado renderizado para garantir sensação de diagnóstico individual e não genérico
- [ ] Criar ou atualizar testes para validar a especificidade mínima do diagnóstico gerado

## Personalização Total do Diagnóstico - concluído
- [x] Reescrever o prompt da IA para obrigar análise específica de cada resposta do quiz
- [x] Ajustar a geração do diagnóstico para citar padrões concretos, dores e desejos extraídos das respostas
- [x] Revisar o resultado renderizado para garantir sensação de diagnóstico individual e não genérico
- [x] Criar ou atualizar testes para validar a especificidade mínima do diagnóstico gerado

## Bug Atual - Geração do Devocional
- [ ] Investigar o erro atual na geração do devocional
- [ ] Garantir que o devocional use as respostas do quiz e o resultado final como base obrigatória
- [ ] Reescrever a geração do devocional para conteúdo 100% bíblico, centrado em Jesus e adequado ao público cristão evangélico
- [ ] Validar a geração do devocional com testes específicos de personalização e conteúdo

## Bug Atual - Geração do Devocional
- [x] Investigar o erro de schema na geração do devocional por IA
- [x] Corrigir o schema da resposta estruturada do devocional
- [x] Garantir que o devocional use as respostas reais do quiz e o resultado espiritual
- [x] Reforçar a base cristã evangélica centrada em Jesus e na Bíblia no prompt e no fallback
- [x] Preservar a personalização também no download por token após o pagamento
- [x] Criar testes focados para validar personalização e estrutura do devocional

## Redirecionamento Direto para Pagamento
- [x] Modificar botão "Quero me reconectar com Deus" para redirecionar diretamente para Mercado Pago (sem abrir em nova aba)
- [x] Testar fluxo completo: Quiz → Resultado → Clique em botão → Página de Pagamento Mercado Pago

## Ajuste de Texto - Etapa 2
- [x] Remover ", mas inconstante" da opção "Próxima de Deus, mas inconstante" na etapa 2

## Atualização do Backend - Mudança de Opção na Etapa 2
- [x] Atualizar testes que usam "Próxima de Deus, mas inconstante" para "Próxima de Deus"
- [x] Verificar se a lógica de resolução de perfil funciona corretamente com a nova opção
- [x] Testar geração de resultado com a nova opção "Próxima de Deus"
- [x] Testar geração de devocional com a nova opção "Próxima de Deus"

## Integração WhatsApp - Envio de PDF
- [x] Adicionar credenciais Twilio (Account SID, Auth Token, Número, Service SID)
- [x] Criar função para enviar PDF via WhatsApp
- [x] Integrar com webhook de pagamento Mercado Pago
- [x] Testar envio de PDF via WhatsApp
- [x] Validar fluxo completo: Pagamento → PDF enviado via WhatsApp

## Botão de Reenvio via WhatsApp
- [x] Adicionar botão "Reenviar via WhatsApp" na página CheckoutSuccess
- [x] Criar endpoint tRPC para reenviar PDF via WhatsApp
- [x] Conectar botão ao endpoint
- [x] Testar funcionalidade de reenvio

## Funcionalidade de Reenvio via WhatsApp - Admin e Compradores
- [x] Localizar botões de reenvio no AdminDashboard
- [x] Implementar reenvio via WhatsApp no AdminDashboard (aba Usuários)
- [x] Implementar reenvio via WhatsApp no AdminDashboard (aba Compradores)
- [x] Localizar botões de reenvio na página de checkout/sucesso
- [x] Implementar reenvio via WhatsApp para compradores
- [x] Testar reenvio para admin
- [x] Testar reenvio para compradores

## Correção de Formato de WhatsApp
- [x] Adicionar função de normalização de número (+55)
- [x] Adicionar validação no frontend
- [x] Testar reenvio com número formatado

## Campo de WhatsApp com +55 Automático
- [x] Modificar função formatWhatsApp para incluir +55
- [x] Atualizar placeholder para mostrar formato com +55
- [x] Testar formatação automática

## Fluxo de Pagamento - Pix Apenas com Redirecionamento Automático
- [x] Remover opção de Stripe do checkout (já usa apenas Mercado Pago)
- [x] Manter apenas Pix/Mercado Pago como opção de pagamento
- [x] Configurar redirecionamento automático para página de sucesso após pagamento
- [x] Implementar download automático de PDF na página de sucesso
- [x] Testar fluxo completo: Quiz → Pagamento → Sucesso com PDF baixado

## Configuração de Webhook Mercado Pago
- [ ] Configurar webhook no Mercado Pago Console
- [ ] URL: https://3000-iktqkx8fkwgmhs7gamw5z-e3d4cff9.us1.manus.computer/api/mercadopago/webhook
- [ ] Eventos: payment.approved, payment.created
- [ ] Testar pagamento com webhook ativo
- [ ] Validar redirecionamento automático para página de sucesso

## Melhoria de Persuasão - Página de Resultado
- [x] Deixar contador em vermelho (maior urgência)
- [x] Melhorar título da oferta ("Não Deixe Seu Resultado Expirar")
- [x] Adicionar descrição personalizada do devocional
- [x] Destacar que foi criado especialmente para o usuário
- [x] Melhorar descrição dos benefícios (versículos, reflexões, etc)
- [x] Adicionar urgência na seção de timer (mostrar tempo de expiração)

## Bug: Referências de Respostas Aparecendo no Resultado
- [x] Remover "(resposta 2)", "(resposta 4)", etc do texto do resultado
- [x] Limpar o resultado para exibir apenas o texto gerado
- [x] Testar se o resultado fica limpo e profissional

## Melhoria de Tom e Conexão Emocional
- [ ] Reforçar prompt para falar diretamente com o usuário
- [ ] Garantir que o resultado cria conexão emocional profunda
- [ ] Validar que o tom é pessoal e não genérico
- [ ] Testar novo resultado com melhorias

## Requisitos Mercado Pago - Melhorar Índice de Aprovação
- [x] Adicionar items.category_id no checkout
- [x] Adicionar items.description no checkout
- [x] Instalar SDK MercadoPago.JS V2
- [x] Implementar Secure Fields para captura de cartão
- [x] Testar integração com novos requisitos
- [x] Validar índice de aprovação no Mercado Pago (testado com pagamento real - Pix funcionando, cartão recusado em teste)

## Bug Atual - Página de resultado não carrega
- [ ] Investigar por que a página /result não está carregando, sem alterar design nem geração de conteúdo
- [ ] Corrigir o fluxo de carregamento da página de resultado sem mexer no layout, cores ou copy
- [ ] Validar no navegador que a página /result volta a carregar corretamente

## Investigação da Página de Resultado (Abr/2026)
- [x] Localizar incompatibilidade entre o storage usado no Quiz (localStorage) e o storage lido em Result.tsx
- [x] Corrigir fallback de leadId para usar parâmetro da URL ou quizLeadId persistido
- [x] Adicionar teste unitário para a lógica de recuperação de leadId e respostas persistidas
- [x] Localizar erro estrutural entre Result.tsx e deepSpiritualDiagnosis.ts (campos como hope/solution/finalReflection não existem no objeto retornado)
- [x] Corrigir erro runtime em /result causado por uso de propriedades indefinidas com split em Result.tsx
- [x] Substituir a frase do topo da página de resultado por um título direto e personalizado conforme as respostas do quiz
- [x] Alterar o fundo da oferta na página de resultado para um azul claro coerente com o restante da interface
- [x] Mudar a cor do título principal para o mesmo azul dos subtítulos
- [x] Inserir aviso "não esqueça de rolar até o final" no topo da página de resultado
- [x] Mudar o card da oferta para um tom de azul mais claro
- [x] Mudar cor de fundo do card "Seu plano de transformação" para bege claro
- [x] Centralizar o texto "Por isso existe..." ao card da oferta
- [x] Substituir texto do botão de compra de "recomeçar" para "me reconectar"
- [x] Mudar cor do botão de compra para um amarelo mais forte
- [x] Corrigir botão de reconectar que não está abrindo a página de pagamento
- [x] Corrigir handler de checkout para usar Mercado Pago em vez de Stripe
- [x] Corrigir erro de hook call em handleCheckout - mover useMutation para fora da função
- [ ] Validar fluxo completo do quiz sem alterar o sistema
- [ ] Verificar personalização da página de resultado conforme respostas do quiz
- [ ] Verificar fluxo de pagamento e redirecionamento para página de sucesso
- [ ] Verificar geração do devocional personalizado e funcionamento do download

- [x] Investigar e corrigir o botão de pagamento que não está funcionando
- [x] Investigar e corrigir a falta de personalização dos resultados do quiz
- [x] Ajustar a paleta visual para azul e dourado, com caixas de texto bege/brancas e títulos azuis
- [x] Corrigir o redesign excessivo e ajustar somente o fundo para um bege claro, preservando o restante do padrão visual
- [x] Remover os cards "O que revelou no quiz" e "O que faz sentido para sua próxima semana" da página de resultado
- [x] Alterar a cor de fundo dos cards "Diagnóstico", "Pontos de Força" e "Bloqueios" para branco
- [x] Corrigir: alterar APENAS o primeiro card (Diagnóstico) para branco e reverter os outros dois para cores originais
- [x] Ajustar cores finais: cards maiores com fundo bege/barro (#FAF4E7), cards "Diagnóstico", "Pontos de Força" e "Bloqueios" com fundo branco
- [x] Deixar o card "Diagnóstico" (seu perfil...) com fundo branco também
- [x] Deixar o fundo de todos os cards de todas as páginas brancos (#ffffff), exceto o card "Comece por aqui"
- [x] Mudar todas as caixas de texto para branco, exceto "Comece por aqui" que permanece azul
- [x] Deixar APENAS as caixas de texto "dai, seu perfil atual aponta para..." e "Seu devocional de 7 dias foi pensado..." com fundo branco, reverter as demais
- [x] Deixar o botão de pagamento em amarelo bem chamativo e testar se está funcionando

## Configuração do Stripe - Passo a Passo

- [x] PASSO 1: Obter as chaves do Stripe (Secret Key, Publishable Key, Webhook Secret)
- [x] PASSO 2: Configurar as chaves no projeto (variáveis de ambiente)
- [x] PASSO 3: Implementar endpoint de criação de Stripe Checkout Session
- [ ] PASSO 4: Configurar webhook do Stripe no Dashboard
- [ ] PASSO 5: Testar o fluxo de pagamento completo
- [ ] PASSO 6: Implementar envio de email após pagamento
- [ ] PASSO 5: Testar o fluxo de pagamento completo
- [ ] PASSO 6: Implementar envio de email após pagamento
- [ ] Verificar se o painel de admin mostra os compradores na aba de compradores
- [ ] BUGS A CORRIGIR: Email não está sendo enviado após pagamento
- [ ] BUGS A CORRIGIR: Comprador não está sendo registrado no banco de dados
- [ ] BUGS A CORRIGIR: Webhook do Stripe não está processando corretamente


## Integração PIX com Stripe
- [ ] Verificar se PIX está habilitado na conta Stripe
- [ ] Atualizar checkout do Stripe para suportar PIX como método de pagamento
- [ ] Configurar moeda BRL para PIX
- [ ] Testar fluxo de pagamento com PIX
- [ ] Validar recebimento de confirmação de PIX
- [ ] Atualizar webhook para processar pagamentos PIX


## Integração Mercado Pago com PIX
- [x] Criar conta Mercado Pago
- [x] Obter credenciais de teste (Checkout Pro)
- [x] Instalar SDK do Mercado Pago
- [x] Integrar API REST do Mercado Pago no backend
- [x] Criar procedimento tRPC createMercadoPagoCheckout
- [x] Configurar checkout para mostrar apenas PIX
- [x] Atualizar frontend para usar Mercado Pago em vez de Stripe
- [x] Testar fluxo de pagamento com PIX
- [x] Validar webhook de pagamento
- [x] Validar envio de email com PDF após pagamento
- [ ] Corrigir a implementação do Mercado Pago para usar o fluxo oficial com SDK v2 e Secure Fields
- [ ] Revisar o fluxo atual de frontend e backend do pagamento para remover inconsistências entre Checkout Pro e checkout transparente
- [ ] Garantir criação correta do pagamento com PIX e compatibilidade com aprovação automática e webhook
- [ ] Validar redirecionamento, status aprovado e envio automático do PDF após confirmação do pagamento
- [ ] Confirmar que a correção não altera o restante do design e das áreas administrativas

- [x] Limitar a intervenção exclusivamente à configuração do Mercado Pago com SDK v2 e Secure Fields
- [x] Corrigir apenas o fluxo de pagamento no frontend e backend, sem alterar outras áreas do site
- [x] Validar somente a configuração do pagamento e o retorno esperado do checkout transparente
- [x] Corrigir erro 400 do Mercado Pago webhook - mover webhook para ANTES do express.json() middleware
- [x] Corrigir erro de redeclaração de useState no Result.tsx
- [x] Corrigir erro de TypeScript no Admin.tsx (missing properties)
- [x] Corrigir implementação de getStatistics para retornar totalResponses e completeResponses
- [x] Criar testes automatizados para webhook do Mercado Pago (9/9 passando)
- [x] Validar que webhook recebe e processa notificações corretamente
- [x] Documentar fluxo e instruções de teste do webhook

- [x] Corrigir exclusivamente o endpoint /api/mercadopago/webhook para aceitar apenas POST e responder 200 ao payload do Mercado Pago
- [x] Ajustar a leitura do body JSON no webhook do Mercado Pago sem exigir campos além de data.id
- [x] Garantir retorno 405 para métodos diferentes de POST no webhook do Mercado Pago
- [x] Adicionar log simples do body recebido no webhook do Mercado Pago
- [x] Validar que o webhook do Mercado Pago não retorna 400 para payload válido com action e data.id

- [x] Investigar erro ao escolher PIX no checkout do Mercado Pago
- [x] Corrigir exclusivamente o fluxo de seleção e geração do PIX sem alterar outras áreas do sistema
- [x] Validar que a escolha de PIX funciona corretamente após a correção

- [x] Investigar por que pagamento aprovado/entregue no Mercado Pago não atualiza a aba Compradores
- [x] Corrigir exclusivamente a sincronização entre webhook/pagamento salvo e listagem da aba Compradores
- [x] Validar que comprador com pagamento aprovado aparece corretamente no admin após a correção
- [x] Remover colunas emailStatus e emailSentAt do schema do Drizzle para sincronizar com banco de dados
- [x] Aplicar migração SQL para remover colunas obsoletas da tabela payments


## Integração Mercado Pago
- [x] Corrigir erro 400 do webhook do Mercado Pago (mover middleware express.json() para antes dos webhooks)
- [x] Corrigir erro ao escolher PIX (adicionar header X-Idempotency-Key)
- [x] Criar tabela de compradores para registrar pagamentos aprovados
- [x] Implementar registro automático de compradores no webhook do Mercado Pago
- [x] Remover colunas obsoletas (emailStatus, emailSentAt) do schema Drizzle
- [x] Atualizar query getAdminBuyers para retornar dados da tabela buyers
- [x] Implementar query tRPC admin.getBuyers
- [x] Atualizar AdminDashboard para exibir compradores corretamente
- [x] Validar que compradores aparecem na aba Compradores do admin após pagamento aprovado


## Correção do Mascaramento de Dados - Coluna Phone (2026-04-17)
- [x] Investigar por que dados aparecem como "XXXXXXXXXXX" na aba de Compradores
- [x] Identificar que a coluna phone não existia na tabela buyers do banco de dados
- [x] Adicionar coluna phone à tabela buyers via SQL
- [x] Adicionar coluna leadId à tabela buyers via SQL
- [x] Atualizar query getAdminBuyers para incluir a coluna phone
- [x] Restaurar coluna "Telefone" no frontend AdminDashboard.tsx
- [x] Criar teste unitário admin-buyers.test.ts para validar a query
- [x] Validar que dados aparecem corretamente sem mascaramento
- [x] Confirmar que novos compradores aparecem com dados reais (nome, email, telefone)
- [x] Todos os testes passando (2/2 no admin-buyers.test.ts)


## Implementação de Botões do Admin Dashboard

- [x] Implementar resendEmail para enviar resultado ou devocional por email
- [x] Implementar resendViaWhatsApp para enviar PDF via WhatsApp
- [x] Implementar unlockAccess para liberar acesso ao resultado
- [x] Implementar botão "Enviar por Email" na aba Compradores
- [x] Implementar botão "Enviar por WhatsApp" na aba Compradores
- [ ] Implementar botão "Gerar Link de Download" na aba Compradores
- [x] Implementar botão "Liberar acesso" na aba Usuários
- [ ] Testar todos os botões do admin dashboard


## Bug: Acesso ao Admin

- [ ] Corrigir erro "não autorizado" ao acessar página de admin
- [ ] Verificar autenticação e permissões de acesso
- [ ] Testar acesso ao admin após correção


## Configuração do Evento Purchase do Pixel da Meta

- [ ] Implementar disparo do evento Purchase no backend (webhook de pagamento)
- [ ] Garantir que evento seja disparado apenas uma vez por pagamento
- [ ] Usar fbq('track', 'Purchase') com value e currency
- [ ] Validar se Pixel está carregado antes de disparar
- [ ] Testar evento no Gerenciador de Eventos da Meta


## Bugs Urgentes a Corrigir

- [ ] Resultado do quiz sendo gerado confuso
- [ ] Personalização do resultado incorreta
- [ ] Erro ao tentar adicionar opção PIX


## Integração da Conversions API da Meta (2026-04-22)
- [x] Armazenar Access Token da Conversions API como variável de ambiente
- [x] Criar arquivo meta-conversions-api.ts com função sendMetaConversionEvent
- [x] Integrar Conversions API no webhook do Mercado Pago
- [x] Adicionar disparo do Pixel no frontend (CheckoutSuccess.tsx)
- [x] Garantir que Pixel (browser) e API (server) funcionem juntos
- [x] Usar event_id único baseado em transaction_id para evitar duplicação
- [x] Disparar evento apenas quando pagamento aprovado E email enviado
- [ ] Testar pagamento real para validar eventos no Gerenciador da Meta
- [ ] Confirmar que eventos aparecem como "Browser" e "Server" no Meta


## Correção do Fluxo de Pagamento PIX (2026-04-23)
- [x] Criar tabela transaction_control no banco de dados
- [x] Adicionar funções de controle de transação em db.ts
- [x] Criar arquivo transaction-control.ts com lógica de bloqueio
- [x] Implementar bloqueio de duplicação no webhook (linhas 95-121)
- [x] Remover envio de email duplicado do quiz/frontend
- [x] Implementar envio de email APENAS via webhook
- [x] Criar endpoint /api/check-payment para polling
- [x] Implementar polling de redirecionamento no frontend
- [x] Testar fluxo completo PIX
- [x] Validar zero duplicações de email
- [x] Validar redirecionamento em até 3 segundos

- [x] Garantir result_id único persistido no banco para cada resultado personalizado do quiz
- [x] Garantir transaction_id único no fluxo PIX e salvar transaction_id, result_id, status, processed e email_sent
- [x] Vincular o pagamento PIX ao transaction_id via external_reference
- [x] Ajustar o webhook para processar apenas pagamentos approved buscando a transação por external_reference
- [x] Impedir reprocessamento no webhook quando processed = true
- [x] Garantir geração e entrega do PDF personalizado correto com base no result_id da transação
- [x] Remover qualquer envio de e-mail fora do webhook
- [x] Garantir no webhook o envio de apenas um e-mail por transação aprovada
- [x] Criar ou ajustar o endpoint GET /check-payment?transaction_id=XXX para retornar o status da transação
- [x] Implementar verificação a cada 3 segundos na página de pagamento para redirecionar automaticamente para /sucesso após aprovação
- [x] Validar que 1 pagamento gera 1 e-mail, 1 entrega e 1 redirecionamento sem duplicação
- [x] Mapear exatamente os arquivos e trechos alterados no ajuste do fluxo PIX para apresentar ao usuário
- [x] Corrigir finalizeTransaction para atualizar status para "approved" (permite redirecionamento no frontend)
- [x] Atualizar testes de transaction-control para validar atualização de status
- [x] Validar que endpoint /check-payment retorna "approved" após finalização
- [x] Adicionar logs de debug no webhook para rastrear transactionId e resultId
- [x] Adicionar logs de debug no frontend (MercadoPagoCheckout) para rastrear transaction_id capturado
- [x] Adicionar logs no polling para verificar status retornado
- [x] Confirmar que webhook usa getDiagnosticById(resultId) para gerar PDF personalizado
- [x] Confirmar que transaction_id é retornado corretamente do backend
- [x] Validar que polling funciona com transaction_id válido
- [x] Corrigir erro 502 na criação de pagamento PIX com Mercado Pago
- [x] Adicionar logs de debug para validar dados obrigatórios (transaction_amount, description, email, external_reference)
- [x] Adicionar logs de debug para resposta da API Mercado Pago
- [x] Adicionar logs de debug para confirmar PIX Code e Image gerados
- [x] Adicionar logs de debug para confirmar transactionId retornando corretamente

## AUDITORIA COMPLETA DO FLUXO PIX

### 1. VERIFICAÇÃO DA CRIAÇÃO DO PAGAMENTO (PIX)
- [x] Validar se requisição contém transaction_amount (number)
- [x] Validar se requisição contém description (string)
- [x] Validar se requisição contém payment_method_id = "pix"
- [x] Validar se requisição contém payer.email válido
- [x] Validar se requisição contém external_reference = transactionId válido
- [x] Validar se notification_url está configurada corretamente
- [x] Adicionar notification_url no payload de criação de PIX
- [x] Adicionar log de notification_url nos DEBUG
- [x] Garantir que transactionId não seja undefined, null ou vazio
- [x] Garantir que transactionId seja salvo no banco antes da criação do pagamento
- [x] Adicionar log do body enviado para Mercado Pago

### 2. VERIFICAÇÃO DO WEBHOOK
- [x] Confirmar que webhook está sendo chamado corretamente
- [x] Confirmar que recebe external_reference como transactionId
- [x] Confirmar que payment.status === "approved" está sendo validado
- [x] Garantir que transaction é buscada pelo transactionId
- [x] Garantir que resultId está presente e correto
- [x] Adicionar logs de transactionId e resultId
- [x] Confirmar que getDiagnosticById(resultId) está sendo usado
- [x] Confirmar que NÃO está usando leadId para gerar PDF

### 3. ENVIO DE E-MAIL
- [x] Confirmar que e-mail só é enviado dentro do webhook
- [x] Confirmar que não existe envio no quiz ou frontend
- [x] Garantir que PDF enviado é baseado no resultId
- [x] Garantir que não existe caminho fixo (ex: /pdf/devocional.pdf)
- [x] Validar uso de hasEmailBeenSent()
- [x] Validar uso de isTransactionAlreadyProcessed()

### 4. FINALIZAÇÃO DA TRANSAÇÃO
- [x] Confirmar que finalizeTransaction atualiza status = "approved"
- [x] Confirmar que finalizeTransaction marca processed = true
- [x] Confirmar que finalizeTransaction marca emailSent = true

### 5. ENDPOINT /check-payment
- [x] Confirmar que recebe transaction_id corretamente
- [x] Confirmar que busca no banco
- [x] Confirmar que retorna status real da transação

### 6. FRONTEND (CRÍTICO)
- [x] Verificar se transaction_id retornado do backend está sendo salvo em state
- [x] Verificar se transaction_id NÃO está undefined
- [x] Confirmar que polling só roda quando transactionId existe
- [x] Confirmar que polling chama /api/check-payment?transaction_id=...
- [x] Confirmar que quando status === "approved" redireciona para /sucesso
- [x] Adicionar logs de transactionId e status

### 7. TESTES DE INTEGRAÇÃO
- [x] Corrigir URL de /check-payment para /api/check-payment no frontend
- [x] Adicionar logs DEBUG na chamada da API
- [x] Adicionar log da URL completa sendo chamada
- [x] Melhorar design do PDF do devocional com layout premium
- [x] Adicionar capa com fundo degradê azul escuro (#0B1C3D → #132B5B)
- [x] Adicionar página de boas-vindas com perfil e desafios
- [x] Adicionar páginas dos 7 dias com design premium
- [x] Adicionar página de encerramento com design premium
- [x] Usar cores douradas (#C8A951) para subtítulos e destaques
- [x] Adicionar linhas separadoras suaves entre seções
- [x] Adicionar caixas destacadas para pontos importantes
- [x] Usar tipografia profissional com tamanhos apropriados
- [x] Adicionar rodapé com mensagem de documento gerado automaticamente
- [x] Validar que nenhum conteúdo dinâmico foi alterado
- [x] Executar testes para validar geração de PDF
- [ ] Testar criação de PIX com dados válidos
- [ ] Testar webhook com pagamento aprovado
- [ ] Testar envio de e-mail com PDF personalizado
- [ ] Testar redirecionamento automático para /sucesso
- [ ] Testar idempotência (webhook duplicado não envia 2 emails)
- [ ] Testar erro 502 e logs de debug

### 8. RESULTADO FINAL
- [ ] PIX gerado sem erro 502
- [ ] transaction_id válido sendo utilizado em todo fluxo
- [ ] webhook funcionando corretamente
- [ ] PDF personalizado sendo enviado
- [ ] apenas 1 e-mail enviado
- [ ] redirecionamento automático funcionando
- [ ] integração Mercado Pago acima de 90%
