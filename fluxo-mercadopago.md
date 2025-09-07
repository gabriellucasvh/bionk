Perfeito, Gabriel. Segue o fluxo de **integração da API de assinaturas recorrentes do Mercado Pago**, em formato de **instruções diretas** para sua IA, sem código:

---

## Fluxo de integração — Mercado Pago (Assinaturas Recorrentes)

### 1. **Criar assinatura (preapproval)**

* Enviar uma requisição `POST` para o endpoint `/preapproval`.
* Incluir no corpo:

  * `payer_email` (e-mail do cliente).
  * `reason` (descrição da assinatura).
  * `auto_recurring`: com frequência (`frequency` e `frequency_type` — por exemplo `1` e `"months"`), valor (`transaction_amount`), moeda (`currency_id`), data de início (`start_date`) e data final (`end_date`) ([Scribd][1]).
* Receber como resposta o `id` da assinatura (identificador da assinatura criada).

### 2. **Salvar dados no sistema**

* Armazenar no banco de dados:

  * `id_assinatura` (ID retornado pelo Mercado Pago).
  * `id_cliente` do seu sistema.
  * `email_cliente`, `status`, `data_criacao`, `próximo_pagamento`, etc. ([Scribd][1]).

### 3. **Monitorar status da assinatura**

* Consultar o status da assinatura via `GET` em `/preapproval/:id`.
* Status possíveis incluem: `active`, `cancelled`, `paused`, `pending`, entre outros mencionados ([Scribd][1]).

### 4. **Receber notificações automáticas (webhooks)**

* Configurar um endpoint no seu sistema para receber eventos do Mercado Pago, como `payment.created` e `preapproval.changed` ([Mercado Pago][2]).
* Atualizar automaticamente o status da assinatura e registrar pagamentos conforme necessário.

### 5. **Consultar pagamentos vinculados à assinatura**

* Para listar pagamentos realizados, usar `GET /v1/payments/search?preapproval_id=:id` ([Scribd][1]).
* Registrar no seu sistema: data, valor, status do pagamento (aprovado, pendente, rejeitado, etc.).

### 6. **Cancelar assinatura**

* Enviar uma requisição `PUT` para `/preapproval/:id` com o corpo `{ "status": "cancelled" }` ([Scribd][1]).
* Atualizar o status no seu sistema para "cancelada".

---

### Resumo em checklist sequencial

1. Requisição `POST /preapproval` → criar assinatura com `auto_recurring` (frequência, valores, datas).
2. Armazenar dados essenciais no sistema (ID, e-mail, status).
3. Consultar status via `GET /preapproval/:id`.
4. Configurar webhooks (receber eventos como pagamento criado, status alterado).
5. Usar `GET /v1/payments/search?preapproval_id=` para listar pagamentos e registrar histórico.
6. Cancelar assinatura com `PUT /preapproval/:id` e atualizar registro.

---

Se preferir um **fluxograma visual (diagrama de passos)** ou desejar que esse conteúdo seja formatado como **checklist simplificado**, posso reorganizar imediatamente. É só me dizer como você prefere!

[1]: https://pt.scribd.com/document/800367156/Integracao-Mercado-pago?utm_source=chatgpt.com "Integração Mercado pago | PDF | Informática"
[2]: https://www.mercadopago.com.co/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications?utm_source=chatgpt.com "Notificações - Suas integrações - Mercado Pago Developers"
