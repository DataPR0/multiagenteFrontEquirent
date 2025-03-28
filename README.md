# Frontend MultiAgente

## Requerimientos:

- Node >= v18.19.0
- npm >= 9.2.0

## Instalación:

1. Clonar el repositorio en una terminal con: 

```bash
git clone https://github.com/DataPR0/MultiAgenteFront.git
```

2. Dentro de la carpeta raiz del proyecto ejecutar el siguiente comando para la instalación de dependencias:

```bash
npm install
```

3. Una vez finalizado se ejecuta por medio del siguiente comando:

```bash
npm run dev
```

Se accede por medio de la siguiente URL: http://localhost:3006/


### Consideraciones

Modificar los Scripts de _package.json_ para exponer el proyecto a un host o puerto en especifico haciendo uso del comando:

```bash
vite --port 8000 --host 127.0.0.1
```

En este ejemplo estamos exponiendo el proyecto bajo la URL: http://127.0.0.1:8000/
