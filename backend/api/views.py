from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import PickedMovie
from .serializers import RegisterSerializer, PickedMovieSerializer

class PickedMovieViewSet(viewsets.ModelViewSet):
    serializer_class = PickedMovieSerializer

    def get_queryset(self):
        return PickedMovie.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        tmdb_id = serializer.validated_data.get("tmdb_id")
        PickedMovie.objects.update_or_create(
            user=self.request.user,
            tmdb_id=tmdb_id,
            defaults={
                "title": serializer.validated_data.get("title"),
                "poster_path": serializer.validated_data.get("poster_path"),
                "rating": serializer.validated_data.get("rating"),
                "choice": serializer.validated_data.get("choice"),
            },
        )

    def list(self, request):
        choice = request.query_params.get("choice")
        queryset = self.get_queryset()
        if choice:
            queryset = queryset.filter(choice=choice)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.GenericAPIView):
    def get(self, request):
        user = request.user
        saved_count = PickedMovie.objects.filter(user=user, choice="saved").count()
        pass_count = PickedMovie.objects.filter(user=user, choice="pass").count()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "saved_count": saved_count,
                "pass_count": pass_count,
            }
        )
