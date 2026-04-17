from django.db import models
from django.conf import settings


class PickedMovie(models.Model):
    CHOICES = [
        ("saved", "Saved"),
        ("pass", "Pass"),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="picks",
    )
    tmdb_id = models.IntegerField()
    title = models.CharField(max_length=255)
    poster_path = models.URLField(max_length=500, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    choice = models.CharField(max_length=10, choices=CHOICES)
    picked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "tmdb_id"]
        ordering = ["-picked_at"]

    def __str__(self):
        return f"{self.user.username}: {self.title} ({self.choice})"
