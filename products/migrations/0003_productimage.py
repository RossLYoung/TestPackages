# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_product_sale_price'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(upload_to=b'products/images/')),
                ('featured', models.BooleanField(default=False)),
                ('thumbnail', models.BooleanField(default=False)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('product', models.ForeignKey(to='products.Product')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
