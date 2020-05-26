from django.contrib import admin
from django.urls import path
from . import views
from django.views.generic.base import TemplateView

app_name ="hato_app"
#ここで定義することで、html上で逆引き検索できる。していない場合、reverse match erorr出る
# 名前空間は「「app_name =<名前空間名>」という形で指定します。
# 名前空間を利用するとテンプレート(html)から {% url ‘<名前空間名>:<URLパターン名称>’ %} というフォーマットで逆引きで
# URLを呼び出すことができます。
# 名前空間を利用していない場合、例えば複数のアプリケーションのurls.py内で「index」というURLパターン名称を設定していた場
# 合に名前の衝突が発生してしまうので、名前空間を設定し一意にURLパターン名称を特定できるようにするのが推奨です。


urlpatterns = [
    path('', views.classify, name='classify'),
    path('signup', views.signup, name='signup'),
    path('history', views.history, name='history')
]
