
FROM node:20

RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto para dentro do container
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Instala as dependências antes de copiar o restante dos arquivos
RUN npm install

# Gera os arquivos do Prisma
RUN npx prisma generate

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta que a aplicação usa (se necessário)
EXPOSE 3000

# Comando para iniciar a aplicação automaticamente
CMD ["node", "src/index.js"]
