# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('commentry', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserPostVote',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.IntegerField(default=0)),
                ('post', models.ForeignKey(related_name='user_votes', to='commentry.MPTTComment')),
                ('user', models.ForeignKey(related_name='post_votes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='userpostvote',
            unique_together=set([('user', 'post')]),
        ),
        migrations.AddField(
            model_name='mpttcomment',
            name='description',
            field=models.TextField(verbose_name=b'Description', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='mpttcomment',
            name='downvotes',
            field=models.IntegerField(default=0, verbose_name=b'Downvotes'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='mpttcomment',
            name='upvotes',
            field=models.IntegerField(default=0, verbose_name=b'Upvotes'),
            preserve_default=True,
        ),
    ]
