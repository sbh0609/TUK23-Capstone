FROM python:3.7

ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /backend

COPY . .

RUN pip install -r requirements.txt

RUN apt-get update

CMD ["python", "back.py"]