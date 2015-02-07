# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('custom_user', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='display_name',
            field=models.CharField(max_length=30, null=True, verbose_name='UserName', blank=True),
            preserve_default=True,
        ),
    ]
