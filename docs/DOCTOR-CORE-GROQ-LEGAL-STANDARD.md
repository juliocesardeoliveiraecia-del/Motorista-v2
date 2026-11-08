# Padrão do Doctor Core — integração de IA com Groq

**Versão:** 1.0  
**Data da revisão:** 05/11/2026  
**Escopo:** Doctor Core e todos os aplicativos derivados, independentemente do concurso.

> Este documento registra uma revisão operacional e de produto baseada nos documentos públicos da Groq consultados em 05/11/2026. Não é parecer jurídico nem substitui a validação de advogado ou uma confirmação escrita da Groq.

## 1. Modelo de integração aprovado para implementação

- O Doctor Core usa a API da Groq como provedor de inferência para recursos de IA.
- Cada aluno cria e administra sua própria conta e sua própria API key na GroqCloud.
- O aplicativo não fornece uma chave compartilhada, não revende uma conta Groq e não cobra pela chave.
- As chamadas são feitas pelo navegador diretamente aos endpoints oficiais da Groq.
- A chave permanece no armazenamento local do navegador e não integra o payload de sincronização de estudos do Doctor.
- Não incluir logotipos, badges ou identidade visual da Groq sem licença escrita.
- Referências textuais à Groq devem ser verdadeiras, necessárias e não sugerir parceria, certificação, patrocínio ou endosso.

## 2. Pontos confirmados nos documentos oficiais consultados

### Contrato de Serviços da Groq

A versão consultada informa:
- idade mínima de 18 anos para acessar ou usar Cloud Services;
- autorização para integrar APIs e serviços de IA a uma Customer Application e disponibilizá-los a End Users;
- responsabilidade do titular pela segurança da conta e das API keys;
- proibição de revender ou alugar acesso à conta;
- obrigação de fornecer avisos e obter consentimentos necessários para o tratamento de dados.

**Ressalva essencial:** o contrato também afirma que Cloud Services e AI Model Services não são para uso de consumidores. Embora o contrato permita integração em Customer Applications e o modelo Doctor seja BYOK, os documentos públicos não esclarecem de forma inequívoca se cada aluno pode usar sua conta pessoal/API key dentro de um aplicativo comercial de terceiro. Portanto, não declarar o BYOK como formalmente aprovado até receber confirmação escrita da Groq.

### Marcas

A política de marcas permite referência factual limitada ao nome da Groq, sem logotipo, desde que a referência não sugira afiliação ou endosso e venha acompanhada de atribuição e disclaimer. O aviso de independência foi incluído na tela de Configurações.

### Dados e retenção

A documentação atual informa que:
- metadados de uso são coletados;
- entradas e saídas de inferência não são retidas por padrão;
- podem existir registros temporários de entradas/saídas por até 30 dias para confiabilidade e monitoramento de abuso, salvo controles aplicáveis;
- Zero Data Retention pode ser ativado pelo administrador da organização na própria GroqCloud;
- dados retidos são armazenados em buckets GCP nos Estados Unidos.

O Doctor não deve prometer retenção zero, não deve afirmar que dados nunca são retidos e não deve dizer que a cota gratuita é sempre renovada no dia seguinte.

### Limites e plano gratuito

Os limites são específicos por modelo e organização e podem incluir RPM, RPD, TPM, TPD e limites de áudio. O aplicativo deve informar que a disponibilidade do nível gratuito e seus limites podem mudar e que eventual cobrança/upgrade é tratado diretamente entre o titular da conta e a Groq.

## 3. Avisos obrigatórios na experiência do aluno

Todos os aplicativos derivados do Doctor Core devem manter:
1. identificação da Groq como provedora de infraestrutura de inferência, não como “a IA do Doctor” ou parceira;
2. aviso de que o usuário cria e administra a própria conta/chave;
3. explicação de que prompts, redações, textos e áudio enviados para funções de IA são encaminhados à Groq;
4. aviso de retenção excepcional, metadados, localização de dados retidos e link para a documentação atual;
5. orientação para não enviar dados pessoais sensíveis, segredos ou dados de terceiros;
6. aviso de que a chave fica no armazenamento local do navegador, que não é um cofre criptográfico;
7. confirmação afirmativa de idade mínima de 18 anos e ciência do tratamento antes de habilitar a integração;
8. forma de desativar a IA e apagar a chave local, com aviso de que a chave também deve ser revogada na GroqCloud;
9. disclaimer de não afiliação e atribuição de marca.

Usuários que não confirmarem 18 anos ou não aceitarem o aviso não podem usar a integração externa; os demais recursos locais/offline do aplicativo devem continuar disponíveis.

## 4. Segurança técnica

- Nunca colocar API keys em repositório, HTML público, URL, logs, telemetria ou payloads de sincronização.
- Nunca enviar a chave para Supabase, Doctor Pay, suporte, analytics ou outros aplicativos.
- Continuar usando allowlist de campos na criação dos snapshots. Não confiar apenas em uma lista de nomes proibidos.
- Não usar chaves compartilhadas entre alunos.
- Não registrar prompts ou respostas de IA em logs de aplicação sem finalidade, base legal, aviso e retenção definidos.
- Orientar o titular a revogar a chave na GroqCloud se houver suspeita de exposição.
- Revisar a arquitetura de armazenamento da chave antes de produção em larga escala: localStorage não é cofre criptográfico e pode ser lido por scripts executados na mesma origem. A presente revisão não migra nem altera o mecanismo existente para evitar interromper a integração em funcionamento.

## 5. LGPD e governança

Antes da operação comercial em escala, a Doctor Concursos deve:
- incluir o fluxo de IA e a transferência internacional aplicável na política de privacidade geral;
- definir, com assessoria jurídica, os papéis de Doctor Concursos, aluno e Groq no modelo BYOK;
- documentar finalidade, categorias de dados, base legal, transparência, direitos dos titulares, retenção e canal de contato;
- evitar inserir dados pessoais em prompts por padrão;
- avaliar o DPA e as salvaguardas contratuais aplicáveis à transferência internacional;
- manter canal para dúvidas, correção e exclusão de dados sob controle do Doctor, sem prometer controlar dados mantidos diretamente na conta Groq do aluno.

O aviso dentro do aplicativo é uma camada de transparência e não substitui a política de privacidade geral, os termos de uso ou um parecer jurídico.

## 6. Confirmação formal pendente da Groq

Enviar ao contato legal da Groq a pergunta abaixo antes de considerar o modelo BYOK juridicamente confirmado:

**Assunto:** Clarification request — BYOK Groq API keys in a commercial third-party application

Hello Groq Legal Team,

We operate Doctor Concursos, a Brazilian educational software platform. Our Doctor Core applications integrate with Groq's API for AI-powered study features.

Our current BYOK design is:
- each end user independently creates and owns their own GroqCloud account and API key;
- the user enters that key locally in their browser-based application;
- requests are sent directly from the user's browser to Groq's official API endpoints;
- we do not provide, share, resell, sublicense, proxy, or centrally bill a Groq account or API key;
- our application does not receive or store the user's key on our servers and excludes it from cloud synchronization payloads.

Could you please confirm in writing:
1. whether this BYOK model is permitted under the current Groq Services Agreement for a commercial third-party application;
2. whether end users may use their individual GroqCloud/API accounts and keys inside our application, or whether a business/organization account or separate agreement is required;
3. whether there are restrictions on the free tier for this specific third-party commercial-app use;
4. which customer/end-user notices, DPA terms, or other requirements apply;
5. whether factual text-only compatibility references to Groq, with the prescribed attribution and non-affiliation disclaimer, are acceptable in our app settings.

We will not use Groq logos or imply partnership or endorsement.

Thank you,
Doctor Concursos
Brazil

**Contato indicado na política de marcas:** trademark-legal@groq.com. Para a interpretação contratual e de uso da API, solicitar encaminhamento ao time responsável pelo Services Agreement.

## 7. Referências oficiais

- Services Agreement: https://console.groq.com/docs/legal/services-agreement
- Your Data in GroqCloud: https://console.groq.com/docs/your-data
- Rate Limits: https://console.groq.com/docs/rate-limits
- Trademark Policy: https://groq.com/trademark-policy
- Policies & Notices: https://console.groq.com/docs/legal
- Privacy Policy: https://groq.com/privacy-policy
