# Usa a imagem oficial do Node.js
FROM node:latest

# Define o diretório de trabalho dentro do container
WORKDIR /

# Copia os arquivos do projeto
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código-fonte
COPY . .

# Expõe a porta do servidor (pode variar)
EXPOSE 3000

# Comando para iniciar a API
CMD ["node", "src/server.js"]
