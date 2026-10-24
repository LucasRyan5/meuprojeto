document.addEventListener('DOMContentLoaded', () => {
    const menuMobileToggle = document.getElementById('menuMobileToggle');
    const menuMobile = document.getElementById('menuMobile');

    function fecharMenuMobile(devolverFoco = false) {
        if (!menuMobileToggle || !menuMobile) return;

        menuMobile.hidden = true;
        menuMobileToggle.setAttribute('aria-expanded', 'false');
        menuMobileToggle.setAttribute('aria-label', 'Abrir menu');
        menuMobileToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

        if (devolverFoco) menuMobileToggle.focus();
    }

    if (menuMobileToggle && menuMobile) {
        menuMobileToggle.addEventListener('click', () => {
            const abrir = menuMobile.hidden;
            menuMobile.hidden = !abrir;
            menuMobileToggle.setAttribute('aria-expanded', String(abrir));
            menuMobileToggle.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
            menuMobileToggle.innerHTML = `<i class="fa-solid fa-${abrir ? 'xmark' : 'bars'}" aria-hidden="true"></i>`;
        });

        menuMobile.addEventListener('click', (event) => {
            if (event.target.closest('a')) fecharMenuMobile();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !menuMobile.hidden) fecharMenuMobile(true);
        });

        window.addEventListener('resize', () => {
            if (window.matchMedia('(min-width: 768px)').matches) fecharMenuMobile();
        });
    }

    // Referências aos elementos do simulador de orçamento
    const tipoServico = document.getElementById('tipoServico');
    const prazo = document.getElementById('prazo');
    const valorEstimado = document.getElementById('valorEstimado');

    // Função para atualizar a estimativa de preço em tempo real
    function atualizarEstimativa() {
        let base = 1000;
        
        if (tipoServico.value === 'landing') base = 800;
        if (tipoServico.value === 'sistema') base = 2200;
        if (tipoServico.value === 'cardapio') base = 1500;
        if (tipoServico.value === 'personalizado') base = 2200;

        if (prazo.value === 'rapido') base *= 1.3; // Adicional de urgência/prioridade

        let max = base * 1.5;
        valorEstimado.textContent = `R$ ${base.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`;
    }

    // Escutadores de eventos para recalcular quando o usuário alterar as opções
    if (tipoServico && prazo) {
        tipoServico.addEventListener('change', atualizarEstimativa);
        prazo.addEventListener('change', atualizarEstimativa);
    }

    // Manipulação do envio do formulário de contratação
    const form = document.getElementById('orcamentoForm');
    const alerta = document.getElementById('sucessoAlerta');
    const erroAlerta = document.getElementById('erroAlerta');
    const emailInput = document.getElementById('contatoCliente');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (alerta) alerta.classList.add('hidden');
            if (erroAlerta) erroAlerta.classList.add('hidden');

            try {
                const resposta = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });

                if (!resposta.ok) {
                    throw new Error(`O Formspree respondeu com status ${resposta.status}.`);
                }

                form.reset();
                form.classList.add('hidden');
                if (alerta) alerta.classList.remove('hidden');
            } catch (erro) {
                console.error('Falha ao enviar solicitação de orçamento:', erro);
                if (erroAlerta) erroAlerta.classList.remove('hidden');
            }
        });
    }

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const invalido = emailInput.value && !validarEmail(emailInput.value.trim());
            emailInput.classList.toggle('border-red-500', Boolean(invalido));
        });

        emailInput.addEventListener('blur', () => {
            const invalido = emailInput.value && !validarEmail(emailInput.value.trim());
            emailInput.classList.toggle('border-red-500', Boolean(invalido));
        });

        emailInput.addEventListener('change', () => {
            emailInput.value = emailInput.value.trim().toLowerCase();
        });
    }

    const chatToggle = document.getElementById('salesChatToggle');
    const chatClose = document.getElementById('salesChatClose');
    const chatPanel = document.getElementById('salesChatPanel');
    const chatMessages = document.getElementById('salesChatMessages');
    const chatForm = document.getElementById('salesChatForm');
    const chatInput = document.getElementById('salesChatInput');

    if (chatToggle && chatClose && chatPanel && chatMessages && chatForm && chatInput) {
        let conversaIniciada = false;
        let recomendacaoAtual = null;

        function adicionarMensagem(texto, autor, opcoes = []) {
            const mensagem = document.createElement('div');
            mensagem.className = `sales-chat-message ${autor === 'cliente' ? 'sales-chat-message-user' : 'sales-chat-message-bot'}`;
            mensagem.textContent = texto;
            chatMessages.appendChild(mensagem);

            if (opcoes.length) {
                const grupo = document.createElement('div');
                grupo.className = 'sales-chat-options';
                opcoes.forEach((opcao) => {
                    const botao = document.createElement('button');
                    botao.type = 'button';
                    botao.className = 'sales-chat-option';
                    botao.textContent = opcao.texto;
                    botao.addEventListener('click', opcao.acao);
                    grupo.appendChild(botao);
                });
                chatMessages.appendChild(grupo);
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function mostrarOpcoesIniciais() {
            adicionarMensagem('O que você gostaria que seu site ou sistema fizesse?', 'consultor', [
                { texto: 'Apresentar minha empresa e atrair clientes', acao: () => recomendar('landing') },
                { texto: 'Apresentar produtos ou cardápio digital', acao: () => recomendar('cardapio') },
                { texto: 'Automatizar tarefas ou organizar processos', acao: () => recomendar('sistema') },
                { texto: 'Tenho uma ideia diferente', acao: pedirDetalhes }
            ]);
        }

        function recomendar(tipo) {
            const recomendacoes = {
                landing: {
                    servico: 'landing',
                    nome: 'Landing page ou site institucional',
                    motivo: 'Uma página profissional ajuda a apresentar sua empresa, destacar seus serviços e facilitar o contato de novos clientes.'
                },
                cardapio: {
                    servico: 'cardapio',
                    nome: 'Cardápio ou plataforma interativa',
                    motivo: 'Uma experiência interativa facilita a apresentação de produtos e serviços e deixa as informações acessíveis aos seus clientes.'
                },
                sistema: {
                    servico: 'sistema',
                    nome: 'Sistema web personalizado',
                    motivo: 'Um sistema web pode centralizar informações, automatizar tarefas e organizar melhor os processos da sua empresa.'
                }
            };
            recomendacaoAtual = recomendacoes[tipo];
            adicionarMensagem(`A solução mais indicada para você é: ${recomendacaoAtual.nome}. ${recomendacaoAtual.motivo}`, 'consultor');
            adicionarMensagem('Quer conversar sobre essa solução ou prefere me contar mais detalhes?', 'consultor', [
                { texto: 'Quero conversar sobre essa solução', acao: abrirFormulario },
                { texto: 'Quero explicar melhor minha ideia', acao: pedirDetalhes }
            ]);
        }

        function pedirDetalhes() {
            recomendacaoAtual = {
                servico: 'personalizado',
                nome: 'Projeto personalizado',
                motivo: 'Sua ideia pode precisar de uma combinação de recursos. Um projeto personalizado permite definir a melhor solução depois de entender os detalhes.'
            };
            adicionarMensagem('Legal! Conte brevemente o que você quer criar e qual problema essa solução deve resolver.', 'consultor');
            chatInput.focus();
        }

        function abrirFormulario() {
            const tipo = document.getElementById('tipoServico');
            const detalhes = document.getElementById('detalhes');
            const textoRecomendacao = recomendacaoAtual
                ? `Recomendação do consultor: ${recomendacaoAtual.nome}. ${recomendacaoAtual.motivo}`
                : '';

            if (tipo && recomendacaoAtual) {
                tipo.value = recomendacaoAtual.servico;
                tipo.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (detalhes && textoRecomendacao) {
                detalhes.value = detalhes.value.trim()
                    ? `${detalhes.value.trim()}\n\n${textoRecomendacao}`
                    : textoRecomendacao;
            }
            chatPanel.hidden = true;
            chatPanel.setAttribute('aria-hidden', 'true');
            chatToggle.setAttribute('aria-expanded', 'false');
            chatToggle.focus();
            document.getElementById('contratar')?.scrollIntoView({ behavior: 'smooth' });
        }

        chatToggle.addEventListener('click', () => {
            const abrir = chatPanel.hidden;
            chatPanel.hidden = !abrir;
            chatPanel.setAttribute('aria-hidden', String(!abrir));
            chatToggle.setAttribute('aria-expanded', String(abrir));

            if (abrir && !conversaIniciada) {
                conversaIniciada = true;
                adicionarMensagem('Olá! Sou o consultor virtual. Vou ajudar você a encontrar o melhor tipo de site para sua empresa ou ideia.', 'consultor');
                mostrarOpcoesIniciais();
            }
            if (abrir) chatInput.focus();
        });

        chatClose.addEventListener('click', () => {
            chatPanel.hidden = true;
            chatPanel.setAttribute('aria-hidden', 'true');
            chatToggle.setAttribute('aria-expanded', 'false');
            chatToggle.focus();
        });

        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const texto = chatInput.value.trim();
            if (!texto) return;

            adicionarMensagem(texto, 'cliente');
            chatInput.value = '';
            recomendacaoAtual = {
                servico: 'personalizado',
                nome: 'Projeto personalizado',
                motivo: `Ideia compartilhada: ${texto}`
            };
            adicionarMensagem('Obrigado por explicar! Como cada ideia é única, o melhor próximo passo é conversar para definir os recursos e o formato ideal do projeto.', 'consultor');
            adicionarMensagem('Quer levar essa ideia para o formulário de orçamento?', 'consultor', [
                { texto: 'Sim, vamos conversar', acao: abrirFormulario },
                { texto: 'Ver outras opções', acao: mostrarOpcoesIniciais }
            ]);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !chatPanel.hidden) {
                chatPanel.hidden = true;
                chatPanel.setAttribute('aria-hidden', 'true');
                chatToggle.setAttribute('aria-expanded', 'false');
                chatToggle.focus();
            }
        });

    }

    const cookieNotice = document.getElementById('cookieNotice');
    const cookieNoticeDismiss = document.getElementById('cookieNoticeDismiss');

    if (cookieNotice && cookieNoticeDismiss) {
        try {
            if (localStorage.getItem('avisoPrivacidadeVisto') !== 'true') {
                cookieNotice.hidden = false;
            }
        } catch (erro) {
            console.error('Não foi possível verificar a preferência do aviso de privacidade:', erro);
            cookieNotice.hidden = false;
        }

        cookieNoticeDismiss.addEventListener('click', () => {
            cookieNotice.hidden = true;
            try {
                localStorage.setItem('avisoPrivacidadeVisto', 'true');
            } catch (erro) {
                console.error('Não foi possível salvar a preferência do aviso de privacidade:', erro);
            }
        });
    }
});
