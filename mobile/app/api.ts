const API_URL = 'http://localhost:8000/api'; // Замените на ваш реальный backend

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Ошибка входа');
  return res.json(); // { access_token: string }
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Ошибка регистрации');
  return res.json();
}

// OAuth: отправляем access_token соцсети на backend, получаем JWT
export async function oauth(provider: 'google' | 'github', accessToken: string) {
  const res = await fetch(`${API_URL}/auth/${provider}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  if (!res.ok) throw new Error('Ошибка OAuth');
  return res.json();
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка загрузки профиля');
  return res.json();
}

export async function getTasks(token: string) {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка загрузки задач');
  return res.json();
}

export async function updateProfile(token: string, data: { name?: string; email?: string; avatar_url?: string }) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка обновления профиля');
  return res.json();
}

export async function getTaskById(token: string, id: string | number) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка загрузки задачи');
  return res.json();
}

export async function respondToTask(token: string, id: string | number) {
  const res = await fetch(`${API_URL}/tasks/${id}/respond`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка отклика на задачу');
  return res.json();
}

export async function updateTask(token: string, id: string | number, data: any) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка обновления задачи');
  return res.json();
}

export async function deleteTask(token: string, id: string | number) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка удаления задачи');
  return res.json();
}

export async function createTask(token: string, data: any) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка создания задачи');
  return res.json();
}

export async function getAiRecommendation(token: string, data: { title: string; description: string }) {
  const res = await fetch(`${API_URL}/ai/task-recommendation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка AI-рекомендации');
  return res.json();
}

export async function sendAiMessage(token: string, message: string) {
  const res = await fetch(`${API_URL}/ai/assistant`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Ошибка AI-ассистента');
  return res.json();
}

export async function getBalance(token: string) {
  const res = await fetch(`${API_URL}/finance/balance`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения баланса');
  return res.json();
}

export async function getTransactions(token: string) {
  const res = await fetch(`${API_URL}/finance/transactions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения истории транзакций');
  return res.json();
}

export async function deposit(token: string, amount: number) {
  const res = await fetch(`${API_URL}/finance/deposit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error('Ошибка пополнения');
  return res.json();
}

export async function withdraw(token: string, amount: number) {
  const res = await fetch(`${API_URL}/finance/withdraw`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error('Ошибка вывода средств');
  return res.json();
}

export async function getNotifications(token: string) {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения уведомлений');
  return res.json();
}

export async function markNotificationRead(token: string, id: string | number) {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка отметки уведомления');
  return res.json();
}

export async function setNotificationSettings(token: string, settings: any) {
  const res = await fetch(`${API_URL}/notification-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Ошибка настройки уведомлений');
  return res.json();
}

export async function getChats(token: string) {
  const res = await fetch(`${API_URL}/chats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения чатов');
  return res.json();
}

export async function getMessages(token: string, chatId: string | number) {
  const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения сообщений');
  return res.json();
}

export async function sendMessage(token: string, chatId: string | number, text: string) {
  const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Ошибка отправки сообщения');
  return res.json();
}

export async function getAchievements(token: string) {
  const res = await fetch(`${API_URL}/achievements`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения достижений');
  return res.json();
}

export async function getReviews(token: string, userId?: string | number) {
  const url = userId ? `${API_URL}/reviews/${userId}` : `${API_URL}/reviews/me`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения отзывов');
  return res.json();
}

export async function addReview(token: string, userId: string | number, data: { rating: number; text: string }) {
  const res = await fetch(`${API_URL}/reviews/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка отправки отзыва');
  return res.json();
}

// 2FA
export async function setup2FA(token: string) {
  const res = await fetch(`${API_URL}/auth/2fa/setup`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка генерации 2FA');
  return res.blob(); // QR-код
}
export async function enable2FA(token: string, code: string) {
  const res = await fetch(`${API_URL}/auth/2fa/enable`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Ошибка включения 2FA');
  return res.json();
}
export async function verify2FA(token: string, code: string) {
  const res = await fetch(`${API_URL}/auth/2fa/verify`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Ошибка проверки 2FA');
  return res.json();
}
export async function disable2FA(token: string) {
  const res = await fetch(`${API_URL}/auth/2fa/disable`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка отключения 2FA');
  return res.json();
}

// KYC
export async function uploadKYC(token: string, type: string, file: File, comment = '') {
  const form = new FormData();
  form.append('document_type', type);
  form.append('file', file);
  form.append('comment', comment);
  const res = await fetch(`${API_URL}/kyc/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Ошибка загрузки KYC');
  return res.json();
}
export async function getKYCStatus(token: string) {
  const res = await fetch(`${API_URL}/kyc/status`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка статуса KYC');
  return res.json();
}

// Escrow & Payments
export async function fundEscrowStripe(token: string, escrowId: number) {
  const res = await fetch(`${API_URL}/escrow/${escrowId}/stripe-intent`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка создания Stripe Intent');
  return res.json();
}
export async function fundEscrowPayPal(token: string, escrowId: number) {
  const res = await fetch(`${API_URL}/escrow/${escrowId}/paypal`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка создания PayPal ссылки');
  return res.json();
}
export async function fundEscrowQiwi(token: string, escrowId: number) {
  const res = await fetch(`${API_URL}/escrow/${escrowId}/qiwi`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка создания Qiwi ссылки');
  return res.json();
}
export async function releaseEscrow(token: string, escrowId: number) {
  const res = await fetch(`${API_URL}/escrow/${escrowId}/release`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка релиза эскроу');
  return res.json();
}
export async function getEscrowStatus(token: string, escrowId: number) {
  const res = await fetch(`${API_URL}/escrow/${escrowId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка статуса эскроу');
  return res.json();
}

// AI Recommendations
export async function getTaskRecommendations(token: string) {
  const res = await fetch(`${API_URL}/ai/recommendations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка AI-рекомендаций');
  return res.json();
}

export async function getApplication(token: string, applicationId: string | number) {
  const res = await fetch(`${API_URL}/applications/${applicationId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка получения заявки');
  return res.json();
} 