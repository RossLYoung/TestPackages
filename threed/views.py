__author__ = 'broostar'

from django.shortcuts import render

def index(request):
    return render(request,'threed/index.html')
