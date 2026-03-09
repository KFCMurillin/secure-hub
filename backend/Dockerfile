FROM python:3.11-alpine

WORKDIR /app

# Instala dependências do sistema necessárias para psutil
RUN apk add --no-cache gcc musl-dev linux-headers

# Copia e instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY api.py .

# Expõe a porta 8080
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["python", "api.py"]
