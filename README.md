# API Farmácia Popular (PFPB) - Códigos de Barras

API NestJS não oficial que consulta o elenco de medicamentos do **Programa Farmácia Popular do Brasil (PFPB)** a partir das listas em PDF publicadas mensalmente pelo Ministério da Saúde.

Não existe API pública do governo para essa consulta. A única fonte disponível é o PDF mensal publicado em `gov.br/saude/.../codigos-de-barras/{ano}/lista-de-medicamentos-pfpb-ean-{mes}-{ano}.pdf`. Este projeto baixa esse PDF, extrai a tabela (produto, indicação, código de barras) e expõe esses dados como uma API REST documentada via Swagger.

Projeto open source sem vínculo com o Ministério da Saúde ou qualquer órgão do governo federal.

## Como rodar

```bash
npm install
npm run start:dev
```

A documentação Swagger fica em `http://localhost:3000/docs`.

## Endpoints

### GET

| Rota | Descrição |
|---|---|
| `GET /medications?month=YYYY-MM` | Lista completa do mês (default: mês atual) |
| `GET /medications/:ean?month=YYYY-MM` | Verifica se um código de barras está no programa |
| `GET /medications/versions` | Lista as versões de parser cadastradas |

### POST

| Rota | Body | Descrição |
|---|---|---|
| `POST /medications` | `{ "month": "YYYY-MM" }` | Lista completa do mês (campo month opcional) |
| `POST /medications/check` | `{ "ean": "...", "month": "YYYY-MM" }` | Verifica se um código de barras está no programa (campo month opcional) |

## Arquitetura (Factory Method)

O pipeline de ingestão tem dois pontos de decisão resolvidos via Factory Method, para isolar o resto do código de mudanças na fonte ou no layout do PDF:

- **`SourceFactory`** decide de onde vem o PDF: download HTTP do gov.br (`HttpMedicationSource`) ou um arquivo local (`LocalFileMedicationSource`, usado em testes e reprocessamento).
- **`ParserFactory`** decide qual parser interpreta o PDF, consultando a **tabela de versionamento** (`src/medications/parsers/version-table.ts`). A decisão é por parâmetro explícito (mês/ano, não por detecção automática do layout), o que torna o processo mais simples e previsível.

```
Trigger (cron/manual)
        │
        ▼
  SourceFactory  ──▶  MedicationSource.fetch() ──▶ Buffer do PDF
        │
        ▼
  ParserFactory  ──▶  MedicationParser.parse() ──▶ linhas cruas
        │
        ▼
  normalizeMedications()  (trim, dedupe por EAN)
        │
        ▼
  MedicationCacheService  (cache em memória por mês)
        │
        ▼
  MedicationsController  (GET/POST /medications, /medications/:ean, /medications/check)
```

### Quando o Ministério da Saúde mudar o layout do PDF

1. Crie uma nova classe de parser (ex.: `PfpbPdfParserV2`) implementando `MedicationParser`.
2. Adicione uma entrada no **topo** de `PARSER_VERSION_TABLE` com o `validFrom` (mês em que o novo layout passou a valer).
3. Não remova as entradas antigas. Assim ainda é possível reprocessar PDFs de meses anteriores com o parser correto.

## Extração do PDF

`PdfTableExtractor` (`src/medications/parsers/pdf-table-extractor.ts`) usa o `pdfjs-dist` para extrair texto **com posição (x, y)** de cada fragmento e reconstrói linhas e colunas por proximidade geométrica. Isso é necessário porque a extração de texto plana (sem posição) embaralha a ordem das colunas em tabelas.

Um caso real tratado explicitamente: a coluna de indicação por vezes quebra em duas linhas dentro do próprio PDF (ex.: "DIABETES MELLITUS + DOENÇA" / "CARDIOVASCULAR"), e isso é inconsistente até dentro do mesmo PDF. A mesma indicação aparece quebrada em uma linha e inteira na linha seguinte. O extrator detecta esse caso pela posição x da linha de continuação e junta o texto na coluna correta.

## Testes manuais e fixtures

A pasta `test/` tem um script (`generate-test-pdf.ts`) que gera um PDF sintético reproduzindo esse padrão de quebra de linha inconsistente, e `test-parser.ts` roda o parser contra ele. Não são testes automatizados (Jest) ainda.

```bash
npx ts-node test/generate-test-pdf.ts
npx ts-node --compiler-options '{"module":"commonjs"}' test/test-parser.ts
```

## Limitações conhecidas

- `HttpMedicationSource` não define `User-Agent` ou headers específicos. Alguns WAFs podem bloquear a requisição dependendo do ambiente de execução.
  
## Licença

MIT.
