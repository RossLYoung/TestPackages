from django.shortcuts import render
from django.http import HttpResponse
from .models import Product


# def index(request):
#     context = {'Products': Product.objects.all()}
#     return render(request, 'products/product.html', context)

def list(request):
    context = {'Products': Product.objects.all()}
    return render(request, 'products/list.html', context)

def single(request, slug):
    context = {'Product': Product.objects.get(slug=slug)}
    return render(request, 'products/detail.html', context)

