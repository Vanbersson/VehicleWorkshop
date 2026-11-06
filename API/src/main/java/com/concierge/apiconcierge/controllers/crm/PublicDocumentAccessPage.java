package com.concierge.apiconcierge.controllers.crm;

import org.springframework.web.util.HtmlUtils;

final class PublicDocumentAccessPage {
    private PublicDocumentAccessPage() {
    }

    static String render(String path, boolean order, boolean invalid) {
        return """
                <!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Confirmar acesso</title><style>
                *{box-sizing:border-box}body{margin:0;background:#f5f7f6;color:#203831;font:15px/1.6 system-ui,sans-serif}main{max-width:460px;margin:8vh auto;padding:24px}.card{background:white;border:1px solid #dfe7e2;border-radius:18px;padding:32px}.eyebrow{font-size:11px;letter-spacing:.1em;font-weight:750;color:#39735c}h1{font-size:27px;line-height:1.25;margin:16px 0 12px}p{color:#6a7973}label{display:block;font-weight:650;margin:24px 0 8px}input,button{width:100%;font:inherit;border-radius:10px;padding:13px}input{border:1px solid #b9cfc2}button{border:0;background:#1c7059;color:white;font-weight:650;cursor:pointer;margin-top:20px}input:focus-visible,button:focus-visible{outline:3px solid #74b398;outline-offset:3px}small{display:block;color:#87938c;margin-top:8px}.error{color:#a32323;background:#fff0f0;padding:12px;border-radius:8px;font-size:13px}footer{text-align:center;font-size:12px;color:#89968e;margin-top:20px}@media(max-width:500px){main{margin:4vh auto;padding:16px}.card{padding:24px}}
                </style></head><body><main><section class="card"><span class="eyebrow">ACESSO $TYPE</span><h1>Confirme seus dados</h1><p>Informe o CNPJ ou CPF do cliente do atendimento para acessar os documentos e a aprovação.</p>$ERROR<form method="post" action="$PATH/access"><label for="taxId">CNPJ ou CPF</label><input id="taxId" name="taxId" type="text" inputmode="numeric" autocomplete="off" maxlength="32" placeholder="Digite o CNPJ ou CPF" required><small>Use o documento cadastrado no atendimento, com ou sem pontuação.</small><button type="submit">Acessar $LOWER</button></form></section><footer>Se não conseguir acessar, entre em contato com o vendedor.</footer></main></body></html>
                """.replace("$TYPE", order ? "AO PEDIDO" : "A PROPOSTA").replace("$LOWER", order ? "pedido" : "proposta").replace("$ERROR", invalid ? "<p class=\"error\" role=\"alert\">Documento não confere com o cliente deste atendimento.</p>" : "").replace("$PATH", HtmlUtils.htmlEscape(path));
    }
}
