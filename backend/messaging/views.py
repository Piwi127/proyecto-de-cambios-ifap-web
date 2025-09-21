from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user).order_by('-updated_at')

    def perform_create(self, serializer):
        participants = self.request.data.get('participants', [])
        if self.request.user.id not in participants:
            participants.append(self.request.user.id)
        serializer.save(participants=participants)

class ConversationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs['pk']
        user = self.request.user
        # Asegurarse de que el usuario es participante de la conversación
        conversation = Conversation.objects.filter(id=conversation_id, participants=user).first()
        if not conversation:
            return Message.objects.none()
        return Message.objects.filter(conversation=conversation).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.kwargs['pk']
        conversation = Conversation.objects.get(id=conversation_id)
        serializer.save(sender=self.request.user, conversation=conversation)

class MessageRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(sender=user)

class MarkMessageAsReadView(generics.UpdateAPIView):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        message = self.get_object()
        if request.user not in message.read_by.all():
            message.read_by.add(request.user)
            message.save()
        return Response(status=status.HTTP_200_OK)

class AddReactionView(generics.UpdateAPIView):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        message = self.get_object()
        reaction = request.data.get('reaction')
        if reaction:
            if reaction not in message.reactions:
                message.reactions[reaction] = []
            if request.user.id not in message.reactions[reaction]:
                message.reactions[reaction].append(request.user.id)
            message.save()
            return Response(status=status.HTTP_200_OK)
        return Response({'detail': 'Reaction not provided'}, status=status.HTTP_400_BAD_REQUEST)

class RemoveReactionView(generics.UpdateAPIView):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        message = self.get_object()
        reaction = request.data.get('reaction')
        if reaction and reaction in message.reactions:
            if request.user.id in message.reactions[reaction]:
                message.reactions[reaction].remove(request.user.id)
                if not message.reactions[reaction]: # Si no quedan usuarios para esa reacción, eliminarla
                    del message.reactions[reaction]
                message.save()
                return Response(status=status.HTTP_200_OK)
        return Response({'detail': 'Reaction or user not found'}, status=status.HTTP_400_BAD_REQUEST)

class AddParticipantsView(generics.UpdateAPIView):
    queryset = Conversation.objects.all()
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        conversation = self.get_object()
        user_ids = request.data.get('user_ids', [])
        if not user_ids:
            return Response({'detail': 'No user IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        for user_id in user_ids:
            conversation.participants.add(user_id)
        conversation.save()
        return Response(ConversationSerializer(conversation).data, status=status.HTTP_200_OK)

class RemoveParticipantsView(generics.UpdateAPIView):
    queryset = Conversation.objects.all()
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        conversation = self.get_object()
        user_ids = request.data.get('user_ids', [])
        if not user_ids:
            return Response({'detail': 'No user IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        for user_id in user_ids:
            conversation.participants.remove(user_id)
        conversation.save()
        return Response(ConversationSerializer(conversation).data, status=status.HTTP_200_OK)
