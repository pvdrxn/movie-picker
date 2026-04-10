from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from .models import Movie
from .serializers import MovieSerializer, RegisterSerializer

class MovieViewSet(viewsets.ModelViewSet):
    serializer_class = MovieSerializer

    def get_queryset(self):
        return Movie.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.GenericAPIView):
    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        )
