from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Reminder


class ReminderModelTest(TestCase):
    """Pruebas para el modelo Reminder"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_reminder_creation(self):
        """Probar la creación de un recordatorio"""
        reminder = Reminder.objects.create(
            user=self.user,
            title='Test Reminder',
            description='Test description',
            reminder_date=timezone.now() + timezone.timedelta(days=1),
            priority='high'
        )
        
        self.assertEqual(reminder.title, 'Test Reminder')
        self.assertEqual(reminder.user, self.user)
        self.assertEqual(reminder.priority, 'high')
        self.assertFalse(reminder.is_completed)
    
    def test_reminder_str_representation(self):
        """Probar la representación en string del recordatorio"""
        reminder_date = timezone.now() + timezone.timedelta(days=1)
        reminder = Reminder.objects.create(
            user=self.user,
            title='Test Reminder',
            reminder_date=reminder_date
        )
        
        expected_str = f"Test Reminder - {reminder_date.strftime('%Y-%m-%d %H:%M')}"
        self.assertEqual(str(reminder), expected_str)


class ReminderAPITest(APITestCase):
    """Pruebas para la API de recordatorios"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_reminder(self):
        """Probar la creación de un recordatorio via API"""
        url = '/api/reminders/'
        data = {
            'title': 'API Test Reminder',
            'description': 'Test via API',
            'reminder_date': (timezone.now() + timezone.timedelta(days=1)).isoformat(),
            'priority': 'medium'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reminder.objects.count(), 1)
        self.assertEqual(Reminder.objects.get().title, 'API Test Reminder')
    
    def test_list_reminders(self):
        """Probar la lista de recordatorios"""
        Reminder.objects.create(
            user=self.user,
            title='Test Reminder',
            reminder_date=timezone.now() + timezone.timedelta(days=1)
        )
        
        url = '/api/reminders/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)