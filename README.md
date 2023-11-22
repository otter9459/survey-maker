# 사전과제

설문지 제작, 관리 및 답변 제출 서비스

<br>

## 실행 방법

### 1. Docker 및 docker-compose 설치

프로젝트를 실행하기 위해서는 Docker 및 docker-compose가 필요합니다. 아래 링크를 참고하여 설치해주세요.

- [Docker 설치 가이드](https://docs.docker.com/get-docker/)
- [docker-compose 설치 가이드](https://docs.docker.com/compose/install/)

### 2. Docker Desktop 설치

만약 Windows 또는 macOS를 사용하고 있다면 Docker Desktop을 설치 후 실행해 주세요.

- [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop)

### 3. 환경변수 설정

- .env.docker

  ```yml
  # Docker 설정
    DATABASE_TYPE=postgres
    DATABASE_HOST=database-server
    DATABASE_PORT=5432
    DATABASE_USERNAME=${name}
    DATABASE_PASSWORD=${password}
    DATABASE_DATABASE=survey-db

  # JWT Secret
    JWT_ACCESS_KEY=${hashing-key}
    JWT_ADMIN_KEY=${hashing-key}
  ```

### 4. 프로젝트 빌드 및 실행

```bash
docker-compose up --build
```

<br>

## 사용 기술 스택

<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white">
<img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
<img src="https://img.shields.io/badge/typeorm-262627?style=for-the-badge&logo=typeorm&logoColor=white">
<img src="https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
<img src="https://img.shields.io/badge/graphql-E10098?style=for-the-badge&logo=graphql&logoColor=white">
<img src="https://img.shields.io/badge/apollo-311C87?style=for-the-badge&logo=apollographql&logoColor=white">
<img src="https://img.shields.io/badge/redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">

<br>

## 주요 기능

1. 사용자 로그인
2. 관리자 로그인
3. 설문지 등록
4. 문항 등록
5. 선택지 등록
6. 답변 제출
7. 답변 조회

<br>

## ERD

<br>

## System architecture

<br>

## API-Docs

### [API 정의서](https://principled-ox-c77.notion.site/API-9c3f8202baf74973b7435258711d18d9?pvs=4)

### [GraphQL Playground](http://localhost:4000/graphql) (docker-compose 컨테이너 실행 후 접속)

<br>

## 테스트 예시

### 관리자 회원가입

```graphql
mutation {
  createAdmin(
    createAdminInput: {
      name: "운영자"
      email: "admin@survey.com"
      password: "1234"
    }
  )
}
```

### 관리자 로그인

```graphql
mutation {
  loginAdmin(
    email: "admin@survey.com"
    password: "1234"
  )
}
```

### 설문지 생성 (관리자 토큰)

```graphql
mutation {
  createSurvey(
    createSurveyInput: {
      title: "새로운 설문입니다."
      description: "설문 설명입니다."
      target_number: 10
    }
  )
}
```

### 문항 생성 (관리자 토큰)

```graphql
mutation {
  createQuestion(
    surveyId: "${survey id}"
    createQuestionInput: {
      content: "1번 문항"
      multiple: false
    }
  )
}
```

### 선택지 생성 (관리자 토큰)

```graphql
mutation {
  createOption(
    questionId: "${question id}"
    createOptionInput: {
      content: "1번"
      score: ONE
    }
  )
}
```

### 설문지 발행 (관리자 토큰)

```graphql
mutation {
  issuanceSurvey(
    surveyId: "${survey id}"
  )
}
```

### 유저 회원가입

```graphql
mutation {
  createUser(
    createUserInput: {
      name: "철수"
      age: 20
      gender: MALE
      email: "a@a.com"
      password: "1111"
    }
  )
}
```

### 유저 로그인

```graphql
mutation {
  loginUser(
    email: "a@a.com"
    password: "1111"
  )
}
```

### 답변 생성 (유저 토큰)

```graphql
mutation {
  createResponse(
    surveyId: "${survey id}"
    createResponseInput: [
      { 
        questionId: "${question id}"
        optionId: [
          "${option id}"
        ]
      }
      {
        questionId: "${question id}"
        optionId: [
          "${option id}"
          "${option id}"
        ]
      }
      {
        questionId: "${question id}"
        optionId: [
          "${option id}"
        ]
      }
    ]
  )
}
```

### 유저 답변 조회 (유저 토큰)

```graphql
query {
  fetchResponseOfMine(
    responseId: "${response id}"
  )
}
```

### 설문지 종료 (관리자 토큰)

```graphql
mutation {
  manualCompleteSurvey(
    surveyId: "${survey id}"
  )
}
```

### 관리자 답변 조회 (관리자 토큰)

```graphql
query {
  fetchCompleteSurvey(
    surveyId: "${survey id}"
    version: "0.1"
  )
}
```