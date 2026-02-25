#!/bin/bash

# Скрипт для тестирования UserService через API Gateway

API_URL="http://localhost:3000/api/microservice"

echo "=========================================="
echo "Тестирование UserService"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для выполнения запроса
test_request() {
    local name=$1
    local service=$2
    local method=$3
    local data=$4
    
    echo -e "${YELLOW}Тест: $name${NC}"
    echo "Запрос: POST $API_URL"
    echo "Service: $service"
    echo "Method: $method"
    echo "Data: $data"
    echo ""
    
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"service\": \"$service\",
            \"method\": \"$method\",
            \"data\": \"$data\"
        }")
    
    echo "Ответ:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Ждем запуска сервисов
echo "Ожидание запуска сервисов..."
sleep 3

# Тест 1: Создание пользователя
echo -e "${GREEN}=== Тест 1: Создание пользователя ===${NC}"
USER_DATA='{"name": "John Doe", "email": "john@example.com"}'
CREATE_RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"service\": \"USER_SERVICE\",
        \"method\": \"UserService.CreateUser\",
        \"data\": \"$USER_DATA\"
    }")

echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

# Извлекаем ID созданного пользователя
USER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id' 2>/dev/null)

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo -e "${RED}ОШИБКА: Не удалось получить ID пользователя${NC}"
    echo "Проверьте, что сервисы запущены и работают корректно"
    exit 1
fi

echo -e "${GREEN}✓ Пользователь создан с ID: $USER_ID${NC}"
echo ""
echo "----------------------------------------"
echo ""

# Тест 2: Получение пользователя
echo -e "${GREEN}=== Тест 2: Получение пользователя ===${NC}"
GET_DATA="{\"id\": \"$USER_ID\"}"
curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"service\": \"USER_SERVICE\",
        \"method\": \"UserService.GetUser\",
        \"data\": \"$GET_DATA\"
    }" | jq '.' 2>/dev/null || echo "Ошибка получения пользователя"
echo ""
echo "----------------------------------------"
echo ""

# Тест 3: Обновление пользователя
echo -e "${GREEN}=== Тест 3: Обновление пользователя ===${NC}"
UPDATE_DATA="{\"id\": \"$USER_ID\", \"name\": \"Jane Doe\", \"email\": \"jane@example.com\"}"
curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"service\": \"USER_SERVICE\",
        \"method\": \"UserService.UpdateUser\",
        \"data\": \"$UPDATE_DATA\"
    }" | jq '.' 2>/dev/null || echo "Ошибка обновления пользователя"
echo ""
echo "----------------------------------------"
echo ""

# Тест 4: Проверка обновленного пользователя
echo -e "${GREEN}=== Тест 4: Проверка обновленного пользователя ===${NC}"
curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"service\": \"USER_SERVICE\",
        \"method\": \"UserService.GetUser\",
        \"data\": \"$GET_DATA\"
    }" | jq '.' 2>/dev/null || echo "Ошибка получения пользователя"
echo ""
echo "----------------------------------------"
echo ""

# Тест 5: Удаление пользователя
echo -e "${GREEN}=== Тест 5: Удаление пользователя ===${NC}"
curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"service\": \"USER_SERVICE\",
        \"method\": \"UserService.DeleteUser\",
        \"data\": \"$GET_DATA\"
    }" | jq '.' 2>/dev/null || echo "Ошибка удаления пользователя"
echo ""
echo "----------------------------------------"
echo ""

# Тест 6: Попытка получить удаленного пользователя (должна быть ошибка)
echo -e "${GREEN}=== Тест 6: Попытка получить удаленного пользователя ===${NC}"
curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"service\": \"USER_SERVICE\",
        \"method\": \"UserService.GetUser\",
        \"data\": \"$GET_DATA\"
    }" | jq '.' 2>/dev/null || echo "Ошибка (ожидаемо)"
echo ""

echo -e "${GREEN}=========================================="
echo "Тестирование завершено!"
echo "==========================================${NC}"
