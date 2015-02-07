# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_auto_20150206_2358'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='slug',
            field=models.SlugField(unique=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='product',
            name='title',
            field=models.CharField(unique=True, max_length=30),
            preserve_default=True,
        ),
    ]
