from django.core.urlresolvers import reverse
from django.db import models


class Product(models.Model):
    title       = models.CharField(max_length=30, null=False, blank=False, unique=True)
    description = models.TextField(null=True,blank=True)
    price       = models.DecimalField(decimal_places=2, max_digits=100, default=29.99)
    sale_price  = models.DecimalField(decimal_places=2, max_digits=100, null=True, blank=True)
    slug        = models.SlugField(unique=True)
    timestamp   = models.DateTimeField(auto_now_add=True, auto_now=False)
    updated     = models.DateTimeField(auto_now_add=False, auto_now=True)
    active      = models.BooleanField(default=True)

    def __unicode__(self):
        return unicode(self.title)

    def get_price(self):
        return self.price

    def get_absolute_url(self):
        return reverse('single-product', kwargs={'slug':self.slug})


class ProductImage(models.Model):
    product   = models.ForeignKey(Product)
    image     = models.ImageField(upload_to='products/images/')
    featured  = models.BooleanField(default=False)
    thumbnail = models.BooleanField(default=False)
    updated   = models.DateTimeField(auto_now_add=False, auto_now=True)

    def __unicode__(self):
        return unicode(self.product.title)