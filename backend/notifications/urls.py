from django.urls import path
from .views import NotificationListView, NotificationMarkAsReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:id>/mark-as-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-as-read'),
]