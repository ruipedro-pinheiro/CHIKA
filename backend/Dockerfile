FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /data
RUN useradd -m -u 1000 chika && chown -R chika:chika /app /data
USER chika

EXPOSE 8000

CMD ["python", "main.py"]
