# Relatório da Fase 1: Exploração da API Last.fm

## 1. Introdução

A primeira fase deste projeto consistiu na exploração e consumo de uma API pública real, a Last.fm API. O objetivo principal foi compreender os fundamentos da comunicação HTTP, a estrutura de pedidos REST e, fundamentalmente, os mecanismos de autenticação e assinatura digital de pedidos (API Signing).

Para a realização dos testes e automação dos pedidos, foi utilizada a ferramenta Postman, permitindo não só efetuar chamadas simples (GET), mas também operações de escrita (POST) que requerem autenticação de utilizador.

## 2. Mecanismo de Autenticação (API Signature)

O maior desafio técnico desta API é o sistema de segurança. Enquanto os pedidos de leitura pública exigem apenas uma `api_key`, os pedidos que alteram dados do utilizador (como fazer *Scrobble* ou atualizar o *Now Playing*) exigem uma Assinatura MD5 (`api_sig`).

### 2.1. O Algoritmo de Assinatura

Conforme a documentação da Last.fm, a assinatura deve ser gerada da seguinte forma:

1.  Ordenar alfabeticamente todos os parâmetros do pedido (exceto `format` e `callback`).
2.  Concatenar o nome do parâmetro e o seu valor (sem `=` ou `&`).
3.  Anexar o "Shared Secret" (chave secreta) ao final da string.
4.  Gerar um Hash MD5 dessa string final.

### 2.2. Automação com Postman (Pre-request Script)

Para evitar calcular este Hash manualmente a cada pedido, implementei um Script de Pré-pedido em JavaScript na coleção do Postman. Este script interceta o pedido antes de ser enviado, calcula a assinatura dinamicamente e injeta-a na variável `{{api_sig}}`.

**Excerto do código implementado:**

```javascript
var apiKey = pm.collectionVariables.get("api_key");
var sharedSecret = pm.collectionVariables.get("shared_secret");

//Obter parâmetros da query
var params = pm.request.url.query.toObject();
var keys = Object.keys(params);

//Ordenar alfabeticamente
keys.sort();

var stringToSign = "";
keys.forEach(function(key) {
    // Ignorar parâmetros que não entram na assinatura
    if (key != "format" && key != "callback" && key != "api_sig") {
        var value = pm.variables.replaceIn(params[key]);
        stringToSign += key + value;
    }
});

//Juntar o Segredo
stringToSign += sharedSecret;

//Gerar MD5 e guardar na variável
var apiSig = CryptoJS.MD5(stringToSign).toString();
pm.collectionVariables.set("api_sig", apiSig);
```
## 3. Fluxo de Autorização (User Session)

Para realizar ações em nome de um utilizador, foi necessário implementar o fluxo de autenticação web:

1.  **Obter Token:** Utilizei o método `auth.getToken` para receber um token temporário.
2.  **Autorização Web:** O token foi validado manualmente no browser (`http://www.last.fm/api/auth/...`), onde o utilizador concede permissão à aplicação.
3.  **Obter Sessão (Session Key):** Através do método `auth.getSession`, troquei o token autorizado por uma `sk` (Session Key) permanente.

**Resposta do pedido `auth.getSession`:**

```json
{
    "session": {
        "name": "UtilizadorTeste",
        "key": "CHAVE_SESSAO_PERMANENTE_SK",
        "subscriber": 0
    }
}
```
### 4. Definição dos Pedidos (Resources)

A coleção desenvolvida contém pedidos que cobrem leitura de dados públicos e escrita de dados privados.

#### 4.1. Leitura de Dados (GET) - artist.getInfo

Este método obtém metadados sobre um artista. Não requer assinatura complexa, apenas a API Key.

*   **Método:** GET
*   **URL:** `{{base_url}}?method=artist.getinfo&artist=Metallica&api_key={{api_key}}&format=json`

#### 4.2. Escrita de Dados (POST) - track.updateNowPlaying

Este é o método mais complexo implementado. Serve para atualizar o estado "A ouvir agora" no perfil do utilizador. Requer o método HTTP POST, a Session Key (`sk`) obtida no passo anterior e a Assinatura (`api_sig`).

*   **Método:** POST
*   **URL:** `{{base_url}}?method=track.updateNowPlaying&artist=Metallica&track=Enter Sandman&sk={{sk}}&api_sig={{api_sig}}`

**Parâmetros Críticos:**

*   `sk`: A chave de sessão do utilizador autenticado.
*   `api_sig`: Gerada automaticamente pelo Pre-request Script com base nos parâmetros `artist`, `method`, `sk` e `track`.

**Resultado:** Ao enviar este pedido, o perfil da Last.fm atualiza instantaneamente para mostrar que o utilizador está a ouvir "Metallica - Enter Sandman".

### 5. Conclusão

A realização da Parte 1 permitiu consolidar conhecimentos sobre o ciclo de vida de um pedido HTTP. A utilização do Postman foi essencial não apenas como cliente HTTP, mas como ambiente de desenvolvimento JavaScript para automatizar tarefas de criptografia (MD5).

A implementação bem-sucedida do método `track.updateNowPlaying` comprova que a gestão de chaves de sessão e a lógica de assinatura de API foram corretamente aplicadas, garantindo a integridade e segurança da comunicação com o servidor da Last.fm.