# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Donation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('school_state', models.CharField(max_length=50)),
                ('resource_type', models.CharField(max_length=50)),
                ('poverty_level', models.CharField(max_length=50)),
                ('date_posted', models.DateField()),
                ('total_donations', models.FloatField(default=0, null=True, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
