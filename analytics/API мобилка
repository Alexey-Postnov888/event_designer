openapi: 3.0.3
info:
  title: Mobile API — Конструктор мероприятий (мобильное приложение)
  version: 1.0.0
  description: API для мобильного приложения (iOS/Android). Авторизация по email-коду, после проверки выдается JWT.
servers:
  - url: https://api.yourdomain.com/mobile
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    RequestCode:
      type: object
      required: [email]
      properties:
        email:
          type: string
          format: email
    VerifyCode:
      type: object
      required: [email, code]
      properties:
        email:
          type: string
          format: email
        code:
          type: string
    TokenResponse:
      type: object
      properties:
        accessToken:
          type: string
        tokenType:
          type: string
          example: Bearer
        expiresIn:
          type: integer
    EventSummary:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        imageUrl:
          type: string
        visibility:
          type: string
          enum: [public, private]
    EventFull:
      $ref: 'admin-api.yaml#/components/schemas/Event' # reference to the Event schema (if using combined files)
paths:
  /auth/request-code:
    post:
      summary: "Запрос кода на email"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RequestCode'
      responses:
        '200':
          description: "Код отправлен"
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "code_sent"
  /auth/verify-code:
    post:
      summary: "Верификация кода и выдача токена"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VerifyCode'
      responses:
        '200':
          description: "Токен выдан"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TokenResponse'
        '401':
          description: "Неверный код"
  /events:
    get:
      summary: "Получить список доступных мероприятий (только public / доступные)"
      security:
        - bearerAuth: []
      responses:
        '200':
          description: "Список мероприятий"
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/EventSummary'
  /events/{id}/full:
    get:
      summary: "Получить весь контент мероприятия (единый эндпоинт для скачивания оффлайн)"
      description: "Возвращает всё: meta, timeline, points, ссылки на media. Используйте для единоразового скачивания."
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: "Полный контент мероприятия"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EventFull'
        '404':
          description: "Не найдено"
  /events/{id}/check-update:
    get:
      summary: "Проверить обновления мероприятия (по версии/etag)"
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: "Информация об обновлении"
          content:
            application/json:
              schema:
                type: object
                properties:
                  updateAvailable:
                    type: boolean
  /events/{id}/download:
    post:
      summary: "Инициировать скачивание (удобство клиенту, фактическая загрузка через /events/{id}/full)"
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '202':
          description: "Скачивание начато"
tags:
  - name: auth
  - name: events
security:
  - bearerAuth: []
