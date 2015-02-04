from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

from django_comments.models import Comment

from mptt.models import MPTTModel, TreeForeignKey


class Thing(models.Model):
    name = models.CharField(max_length=24)


class MPTTComment(MPTTModel, Comment):

    """ Threaded comments - Add support for the parent comment store and MPTT traversal"""
    # a link to comment that is being replied, if one exists

    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')

    class MPTTMeta:
        # comments on one level will be ordered by date of creation
        order_insertion_by=['submit_date']


    class Meta:
        ordering=['tree_id','lft']

    upvotes = models.IntegerField(null=False, verbose_name = "Upvotes", default=0)
    downvotes = models.IntegerField(null=False, verbose_name = "Downvotes", default=0)
    description = models.TextField(blank=True, verbose_name="Description")

    def recompute_votes(self):
        self.upvotes = CommentVote.objects.filter(post=self, value=1).count()
        self.downvotes = CommentVote.objects.filter(post=self, value=-1).count()
        self.save()

    def __unicode__(self):
        return unicode(self.create_time)+unicode(self.link)


class CommentVote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,related_name="post_votes")
    post = models.ForeignKey(MPTTComment,related_name="user_votes")
    value = models.IntegerField(null=False, default=0)

    class Meta:
        unique_together = ("user","post")

    def vote(self,voteval):
        """ Change the vote value to voteval and re-adjust the de-normalized vote count of the post """
        #Reset values, before setting new vote values, updating score and saving
        #Reset vote value to 0, and update comment creator and comment votes
        #WITHOUT SAVING
        if(self.value != 0): #If vote is zero, nothing to reset
            if(self.value>0):
                self.post.upvotes -= 1
            if(self.value<0):
                self.post.downvotes -= 1
            self.value = 0
        #values resetted
        #now perform vote
        if(voteval>0):
            self.post.upvotes += 1
            self.value = 1
        if(voteval<0):
            self.post.downvotes += 1
            self.value = -1
        self.post.save()
        self.save()
    def __unicode__(self):
        return u"%s %s %s" % (self.post.id,self.post, self.value)