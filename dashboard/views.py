from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from wphp import PHPApp


def is_member(user):
    if user:
        return user.is_superuser or user.groups.filter(name='dashboard')

@login_required(login_url='/accounts/login/')
@user_passes_test(is_member) # or @user_passes_test(is_in_multiple_groups)

def index(request):
    return render(request, 'index.html')
    
def test(request):
    return render(request, 'test.html')   

def proxy(request):
	return render(request, 'proxy.php') 