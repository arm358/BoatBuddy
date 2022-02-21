from django.db import models

# Create your models here.

class Marker(models.Model):
    name = models.CharField(max_length=30)
    uid = models.CharField(max_length=7)
    latitude = models.DecimalField(decimal_places=5, max_digits=7)
    longitude = models.DecimalField(decimal_places=5, max_digits=7)
    caption = models.CharField(max_length=50, null=True, blank=True)