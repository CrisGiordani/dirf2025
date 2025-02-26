
FROM node:20

RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia todos os arquivos do projeto para o container
COPY . .

# Instala as dependências do projeto
RUN npm install

# Gera os arquivos do Prisma
RUN npx prisma generate

# Expõe a porta que a aplicação usa (se necessário)
EXPOSE 3000

# Comando para iniciar a aplicação automaticamente
CMD ["node", "src/index.js"]
