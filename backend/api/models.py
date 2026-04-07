from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=255)
    overview = models.TextField()
    release_date = models.DateField(null=True, blank=True)
    poster_path = models.URLField(max_length=500, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
