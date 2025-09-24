from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ContactInfo, ContactFormSubmission
from .serializers import ContactInfoSerializer, ContactFormSubmissionSerializer

from django.http import JsonResponse

def contact_info_test_view(request):
    return JsonResponse({'message': 'Contact Info Test View'})

class ContactInfoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        # Asegurarse de que siempre haya al menos un objeto ContactInfo
        if not ContactInfo.objects.exists():
            ContactInfo.objects.create(
                address="Dirección de ejemplo",
                phone="+123456789",
                email="info@example.com",
                hours="L-V: 9am-5pm"
            )
        
        # Siempre devolver el primer objeto ContactInfo
        instance = ContactInfo.objects.first()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ContactFormSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ContactFormSubmission.objects.all()
    serializer_class = ContactFormSubmissionSerializer

    @action(detail=False, methods=['post'])
    def submit(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'status': 'submission received'}, status=status.HTTP_201_CREATED)
