# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('commentry', '0002_auto_20150120_1307'),
    ]

    operations = [
        migrations.CreateModel(
            name='CommentVote',
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
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='userpostvote',
            name='post',
        ),
        migrations.RemoveField(
            model_name='userpostvote',
            name='user',
        ),
        migrations.DeleteModel(
            name='UserPostVote',
        ),
        migrations.AlterUniqueTogether(
            name='commentvote',
            unique_together=set([('user', 'post')]),
        ),
    ]
