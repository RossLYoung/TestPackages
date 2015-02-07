from django.shortcuts import render, redirect
from models import Thing

# Create your views here.
def home(request):
    #if thing is post, add, redirect to self
    if request.method == 'POST':
        thing_name = request.POST['thing_text']
        Thing.objects.create(name=thing_name)
        return redirect('/')

    things_ = Thing.objects.all()
    return render(request, 'home.html',{'things': things_})


def thing(request, thing_id, fucking_var):
    thing_ = Thing.objects.get(id=thing_id)
    return render(request, 'thing.html', {'thing': thing_})