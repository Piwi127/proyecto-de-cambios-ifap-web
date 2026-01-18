import { api } from './api';

const STORAGE_KEY = 'ifap_reminders';

const getLocalReminders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading reminders from storage:', error);
    return [];
  }
};

const setLocalReminders = (reminders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminders to storage:', error);
  }
};

const normalizeReminder = (reminder) => ({
  id: reminder.id,
  title: reminder.title || '',
  description: reminder.description || '',
  reminder_date: reminder.reminder_date,
  priority: reminder.priority || 'medium',
  status: reminder.status || 'pending'
});

const unwrapApiList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return null;
};

let remindersApiAvailable = true;

const tryApi = async (fn) => {
  if (!remindersApiAvailable) {
    return { ok: false, skipped: true };
  }
  try {
    const response = await fn();
    return { ok: true, data: response.data };
  } catch (error) {
    if (error?.response?.status === 404) {
      remindersApiAvailable = false;
    }
    return { ok: false, error };
  }
};

const getReminders = async () => {
  const apiResult = await tryApi(() => api.get('/reminders/', { suppressErrorStatuses: [404] }));
  if (apiResult.ok) {
    const list = unwrapApiList(apiResult.data);
    if (list) return list.map(normalizeReminder);
  }
  return getLocalReminders().map(normalizeReminder);
};

const createReminder = async (payload) => {
  const apiResult = await tryApi(() => api.post('/reminders/', payload, { suppressErrorStatuses: [404] }));
  if (apiResult.ok) return normalizeReminder(apiResult.data);

  const reminders = getLocalReminders();
  const reminder = normalizeReminder({
    ...payload,
    id: Date.now()
  });
  reminders.push(reminder);
  setLocalReminders(reminders);
  return reminder;
};

const updateReminder = async (reminderId, payload) => {
  const apiResult = await tryApi(() => api.put(`/reminders/${reminderId}/`, payload, { suppressErrorStatuses: [404] }));
  if (apiResult.ok) return normalizeReminder(apiResult.data);

  const reminders = getLocalReminders();
  const updated = reminders.map((reminder) =>
    reminder.id === reminderId ? { ...reminder, ...payload } : reminder
  );
  setLocalReminders(updated);
  return normalizeReminder(updated.find((reminder) => reminder.id === reminderId) || payload);
};

const deleteReminder = async (reminderId) => {
  const apiResult = await tryApi(() => api.delete(`/reminders/${reminderId}/`, { suppressErrorStatuses: [404] }));
  if (apiResult.ok) return true;

  const reminders = getLocalReminders().filter((reminder) => reminder.id !== reminderId);
  setLocalReminders(reminders);
  return true;
};

const updateReminderStatus = async (reminderId, status) => {
  return updateReminder(reminderId, { status });
};

export default {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  updateReminderStatus
};
