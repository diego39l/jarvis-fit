# Jarvis Fit 1.1

PWA gratuito para Android: corrida, CrossFit e alimentação com dados locais, registros de treinos, esforço percebido e alertas de recuperação.

## Executar

Requer Node.js 22:

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
npm run preview
```

## Privacidade e limitações

- Registros armazenados no IndexedDB do dispositivo. Use o botão de exportar backup na aba Evolução.
- Treinos são exemplos iniciais, sem progressão automática individualizada.
- Sugestões alimentares não calculam metas nutricionais personalizadas.
- Não há GPS, integração com relógios nem sincronização.
- Para publicar no Android, será necessário HTTPS e configuração de hospedagem PWA.

## Referências

- https://web.dev/learn/pwa
- https://www.who.int/news-room/fact-sheets/detail/physical-activity
