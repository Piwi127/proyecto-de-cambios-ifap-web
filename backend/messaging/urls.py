from django.urls import path
from .views import ConversationListCreateView, ConversationRetrieveUpdateDestroyView, MessageListCreateView, MessageRetrieveUpdateDestroyView, MarkMessageAsReadView, AddReactionView, RemoveReactionView, AddParticipantsView, RemoveParticipantsView

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:pk>/', ConversationRetrieveUpdateDestroyView.as_view(), name='conversation-retrieve-update-destroy'),
    path('conversations/<int:pk>/messages/', MessageListCreateView.as_view(), name='conversation-messages'),
    path('messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', MessageRetrieveUpdateDestroyView.as_view(), name='message-retrieve-update-destroy'),
    path('messages/<int:pk>/mark_as_read/', MarkMessageAsReadView.as_view(), name='mark-message-as-read'),
    path('messages/<int:pk>/add_reaction/', AddReactionView.as_view(), name='add-reaction'),
    path('messages/<int:pk>/remove_reaction/', RemoveReactionView.as_view(), name='remove-reaction'),
    path('conversations/<int:pk>/add_participants/', AddParticipantsView.as_view(), name='add-participants'),
    path('conversations/<int:pk>/remove_participants/', RemoveParticipantsView.as_view(), name='remove-participants'),
]