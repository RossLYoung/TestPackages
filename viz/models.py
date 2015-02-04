from django.db import models


class Donation(models.Model):
    school_state    = models.CharField(max_length=100)
    resource_type   = models.CharField(max_length=100)
    poverty_level   = models.CharField(max_length=100)
    date_posted     = models.DateField()
    total_donations = models.FloatField(default=0, null=True, blank=True)
