# AI Visual Orb ✨

Interface visual 3D inspirada em visualizações neurais: uma nuvem de partículas que reage ao microfone e muda de comportamento conforme a IA está aguardando, ouvindo, pensando ou falando.

## O que já existe

- Three.js para renderização 3D.
- 9.000 partículas com shader customizado.
- Conexões neurais aleatórias entre pontos.
- Movimento orgânico e rotação contínua.
- Reação ao volume do microfone.
- Estados visuais: `idle`, `listening`, `thinking` e `speaking`.
- Speech Recognition em navegadores compatíveis.
- Text-to-Speech em português do Brasil.
- Modo demonstração sem microfone.
- Adaptado para desktop e celular.
- Adaptador de IA separado, com fallback local para o protótipo.

## Rodar localmente

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite.

Para usar o microfone, conceda a permissão quando o navegador solicitar. Em produção, o microfone normalmente exige HTTPS ou localhost.

## Conectar uma IA real

O arquivo `src/ai.js` é deliberadamente independente do provedor. Para uma aplicação real, crie um pequeno backend que mantenha a chave da API em segredo e faça o navegador conversar com esse backend.

Não coloque uma chave de API diretamente no JavaScript do navegador.

Arquitetura sugerida:

```text
Microfone
   ↓
Speech Recognition
   ↓
Frontend
   ↓ HTTPS
Seu backend
   ↓
LLM
   ↓
Resposta
   ↓
TTS + estado visual
```

## Próximas evoluções

1. Backend para LLM.
2. Streaming de resposta token a token.
3. TTS em streaming.
4. Partículas reagindo às frequências da voz da IA.
5. Bloom e pós-processamento para aproximar ainda mais o visual da referência.
6. Conexões neurais dinâmicas em vez de ligações aleatórias fixas.
7. Memória de conversa.
8. Personalidade e comandos para a entidade visual.

## Licença

Uso pessoal e experimental. Adicione uma licença própria antes de distribuir o projeto.
