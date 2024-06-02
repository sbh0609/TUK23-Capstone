FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /backend

COPY . .

RUN pip install -r requirements.txt

RUN apt-get update

CMD ["python", "back.py"]