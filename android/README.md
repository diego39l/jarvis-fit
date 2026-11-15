# GPS Android — primeira implementação (protótipo)
O serviço `TrackingService.kt` registra coordenadas em armazenamento privado JSONL, com notificação persistente e filtragem básica de precisão e velocidade. Ele **não é um aplicativo instalável ainda**: faltam Gradle, Activity, solicitação de permissões em runtime, interface, estados de pausa/retomada, sessão de corrida, exportação e integração com PWA.
## Requisitos para APK
- Criar projeto Android Gradle com Kotlin e AndroidX Core; `minSdk` e `targetSdk` definidos e testados.
- Activity visível pede localização precisa e inicia serviço via `ContextCompat.startForegroundService`; o serviço não deve iniciar automaticamente do background.
- Solicitar permissão de notificações no Android 13+ para experiência completa.
- Lidar com perda de GPS, retomada de processo, bateria, mudança de permissão, rota longa, reinício, corrida em ambiente urbano e tela bloqueada.
- Adicionar testes unitários/instrumentados e CI Android; compilar APK e testar fisicamente.
- Não declarar GPS validado antes de execução real com tela bloqueada.
## Limitações conhecidas
A distância é incremental e reinicia ao recriar o serviço, embora os pontos persistam. A filtragem simples pode rejeitar deslocamentos reais ou aceitar ruído. O arquivo é protótipo e não deve ser utilizado como registro de treino de produção. Não há integração com dashboard nem mapa.
