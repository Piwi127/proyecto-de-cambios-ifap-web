import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Course
from lessons.models import Lesson
from .models import Quiz, Question, Option, QuizAttempt, UserAnswer

User = get_user_model()

class QuizModelTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@test.com',
            password='testpass123'
        )
        self.instructor.set_role('instructor')
        self.instructor.save()
        
        self.student = User.objects.create_user(
            username='student',
            email='student@test.com',
            password='testpass123'
        )
        self.student.set_role('student')
        self.student.save()
        
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.instructor
        )
        self.course.students.add(self.student)

    def test_quiz_creation(self):
        quiz = Quiz.objects.create(
            title='Test Quiz',
            description='Test Description',
            course=self.course,
            created_by=self.instructor,
            passing_score=70
        )
        self.assertEqual(quiz.title, 'Test Quiz')
        self.assertEqual(quiz.passing_score, 70)

    def test_question_creation(self):
        quiz = Quiz.objects.create(
            title='Test Quiz',
            course=self.course,
            created_by=self.instructor
        )
        question = Question.objects.create(
            quiz=quiz,
            question_text='What is 2+2?',
            question_type='multiple_choice',
            points=10
        )
        self.assertEqual(question.question_text, 'What is 2+2?')
        self.assertEqual(question.points, 10)

class QuizAPITest(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@test.com',
            password='testpass123'
        )
        self.instructor.set_role('instructor')
        self.instructor.save()
        
        self.student = User.objects.create_user(
            username='student',
            email='student@test.com',
            password='testpass123'
        )
        self.student.set_role('student')
        self.student.save()
        
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.instructor
        )
        self.course.students.add(self.student)

        self.quiz = Quiz.objects.create(
            title='Test Quiz',
            description='Test Description',
            course=self.course,
            created_by=self.instructor,
            passing_score=70,
            is_published=True
        )

        self.question = Question.objects.create(
            quiz=self.quiz,
            question_text='What is 2+2?',
            question_type='multiple_choice',
            points=10
        )

        self.option1 = Option.objects.create(
            question=self.question,
            option_text='3',
            is_correct=False
        )
        self.option2 = Option.objects.create(
            question=self.question,
            option_text='4',
            is_correct=True
        )

    def test_quiz_list_as_student(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/quizzes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_quiz_creation_as_instructor(self):
        self.client.force_authenticate(user=self.instructor)
        data = {
            'title': 'New Quiz',
            'description': 'New Quiz Description',
            'course': self.course.id,
            'passing_score': 75
        }
        response = self.client.post('/api/quizzes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Quiz')

    def test_quiz_attempt_creation(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/quizzes/{self.quiz.id}/start_attempt/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)

    def test_quiz_submission(self):
        self.client.force_authenticate(user=self.student)
        # Start attempt first
        attempt_response = self.client.post(f'/api/quizzes/{self.quiz.id}/start_attempt/')
        attempt_id = attempt_response.data['id']

        # Submit answers
        submission_data = {
            'answers': [
                {
                    'question_id': self.question.id,
                    'selected_options': [self.option2.id]
                }
            ]
        }
        response = self.client.post(f'/api/quizzes/{self.quiz.id}/submit/', submission_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('score', response.data)

    def test_quiz_results(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f'/api/quizzes/{self.quiz.id}/results/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_question_creation_as_instructor(self):
        self.client.force_authenticate(user=self.instructor)
        data = {
            'quiz': self.quiz.id,
            'question_text': 'What is 3+3?',
            'question_type': 'multiple_choice',
            'points': 5,
            'options': [
                {'option_text': '5', 'is_correct': False},
                {'option_text': '6', 'is_correct': True}
            ]
        }
        response = self.client.post('/api/questions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_stats(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/stats/user_stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_attempts', response.data)

    def test_student_cannot_create_quiz(self):
        """Test that students cannot create quizzes"""
        self.client.force_authenticate(user=self.student)
        data = {
            'title': 'Student Quiz',
            'description': 'This should fail',
            'course': self.course.id,
            'passing_score': 70,
            'max_attempts': 3
        }
        response = self.client.post('/api/quizzes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_update_quiz(self):
        """Test that students cannot update quizzes"""
        self.client.force_authenticate(user=self.student)
        data = {
            'title': 'Updated Quiz Title',
            'description': 'Updated description'
        }
        response = self.client.patch(f'/api/quizzes/{self.quiz.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_delete_quiz(self):
        """Test that students cannot delete quizzes"""
        self.client.force_authenticate(user=self.student)
        response = self.client.delete(f'/api/quizzes/{self.quiz.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)