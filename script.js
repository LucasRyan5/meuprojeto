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
});
