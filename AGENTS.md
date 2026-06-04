# Reglas para el agente

## Versionado y releases

- La versión en `package.json` debe coincidir siempre con la versión del tag de git (`v<version>`) y con la versión del artifact generado (`${name}-${version}-setup.exe`).
- Al hacer un commit que preceda a un release, actualizar `package.json` con el mismo número de versión que llevará el tag y el release de GitHub.
