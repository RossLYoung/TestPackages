import sys

from django.shortcuts import render
from django.http import JsonResponse
from django.core import serializers
from django.template.response import TemplateResponse
from viz.models import Donation
import timeit

# Create your views here.
def index(request):
    return render(request,'viz/index.html')
    #return TemplateResponse(request, '.base.html')

def projects(request):
    #print(timeit.timeit(serializers.serialize("json", Donation.objects.all()[:300]), number=1))
    projects = serializers.serialize("json", Donation.objects.all()[:300])

    #print(sys.getsizeof(projects));
    return JsonResponse(projects, safe=False)

#data = serializers.serialize("xml", SomeModel.objects.all())