FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /backend

# Node.js와 npm 설치
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# package.json 파일을 복사하고 npm install 실행
COPY package.json ./
RUN npm install

# 나머지 파일 복사 및 Python 패키지 설치
COPY . .
RUN pip install -r requirements.txt

CMD ["python", "back.py"]