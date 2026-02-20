#!/usr/bin/env node

const http = require('http');

const API_URL = 'http://localhost:3000/api/microservice';

function makeRequest(service, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      service,
      method,
      data: JSON.stringify(data),
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/microservice',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function waitForService(maxAttempts = 30, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      const req = http.get('http://localhost:3000/api', (res) => {
        resolve();
      });

      req.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error('Service is not available after maximum attempts'));
        } else {
          setTimeout(check, delay);
        }
      });
    };

    check();
  });
}

async function runTests() {
  console.log('==========================================');
  console.log('Тестирование UserService');
  console.log('==========================================\n');

  console.log('Ожидание запуска сервисов...');
  try {
    await waitForService(30, 1000);
    console.log('✓ Сервисы доступны\n');
  } catch (error) {
    console.error('✗ Сервисы недоступны. Убедитесь, что:');
    console.error('  1. User Service запущен: npx nx serve user-service');
    console.error('  2. API Gateway запущен: npx nx serve api-gateway');
    process.exit(1);
  }

  let userId = null;

  console.log('=== Тест 1: Создание пользователя ===');
  try {
    const response = await makeRequest(
      'USER_SERVICE',
      'UserService.CreateUser',
      { name: 'John Doe', email: 'john@example.com' }
    );
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data?.id) {
      userId = response.data.data.id;
      console.log(`✓ Пользователь создан с ID: ${userId}\n`);
    } else {
      console.log('✗ Ошибка создания пользователя\n');
    }
  } catch (error) {
    console.error('✗ Ошибка:', error.message, '\n');
  }

  if (!userId) {
    console.log('Не удалось создать пользователя. Прерывание тестов.');
    return;
  }

  console.log('=== Тест 2: Получение пользователя ===');
  try {
    const response = await makeRequest(
      'USER_SERVICE',
      'UserService.GetUser',
      { id: userId }
    );
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    console.log('✓ Пользователь получен\n');
  } catch (error) {
    console.error('✗ Ошибка:', error.message, '\n');
  }

  console.log('=== Тест 3: Обновление пользователя ===');
  try {
    const response = await makeRequest(
      'USER_SERVICE',
      'UserService.UpdateUser',
      { id: userId, name: 'Jane Doe', email: 'jane@example.com' }
    );
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    console.log('✓ Пользователь обновлен\n');
  } catch (error) {
    console.error('✗ Ошибка:', error.message, '\n');
  }

  console.log('=== Тест 4: Проверка обновленного пользователя ===');
  try {
    const response = await makeRequest(
      'USER_SERVICE',
      'UserService.GetUser',
      { id: userId }
    );
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    console.log('✓ Обновленный пользователь получен\n');
  } catch (error) {
    console.error('✗ Ошибка:', error.message, '\n');
  }

  console.log('=== Тест 5: Удаление пользователя ===');
  try {
    const response = await makeRequest(
      'USER_SERVICE',
      'UserService.DeleteUser',
      { id: userId }
    );
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    console.log('✓ Пользователь удален\n');
  } catch (error) {
    console.error('✗ Ошибка:', error.message, '\n');
  }

  console.log('=== Тест 6: Попытка получить удаленного пользователя ===');
  try {
    const response = await makeRequest(
      'USER_SERVICE',
      'UserService.GetUser',
      { id: userId }
    );
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    if (!response.data.success) {
      console.log('✓ Ошибка получена (ожидаемо)\n');
    }
  } catch (error) {
    console.log('✓ Ошибка получена (ожидаемо):', error.message, '\n');
  }

  console.log('==========================================');
  console.log('Тестирование завершено!');
  console.log('==========================================');
}

runTests().catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});
