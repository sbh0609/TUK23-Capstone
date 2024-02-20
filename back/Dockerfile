FROM python:3.7

WORKDIR /backend

COPY . .

RUN pip install -r requirements.txt

RUN apt-get update

CMD ["python", "back.py", "--host=0.0.0.0"]