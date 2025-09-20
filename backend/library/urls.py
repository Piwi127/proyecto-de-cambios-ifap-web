from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LibraryCategoryViewSet, LibraryFileViewSet, LibraryAccessViewSet,
    LibraryDownloadViewSet, LibraryFavoriteViewSet
)

router = DefaultRouter()
router.register(r'categories', LibraryCategoryViewSet)
router.register(r'files', LibraryFileViewSet)
router.register(r'access', LibraryAccessViewSet)
router.register(r'downloads', LibraryDownloadViewSet)
router.register(r'favorites', LibraryFavoriteViewSet, basename='libraryfavorite')

urlpatterns = [
    path('', include(router.urls)),
]