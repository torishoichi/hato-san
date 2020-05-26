from django.shortcuts import render, redirect
# DBのインポート
from .models import ZooCollection, AnimalInfo

import os
import subprocess

def prepare_data(filepath):
    import numpy as np
    import cv2
    try:
        img = cv2.resize(filepath, (224, 224)).astype('f').transpose(2,0,1)

    except Exception as e:
        print(e, filepath, 'error')
        img = filepath

    return img

# DB内にデータがない場合に動物データを登録したDBの作成
animalsinfo = list(AnimalInfo.objects.all())
if not animalsinfo:
    with open('static/data/hato_data.csv', 'r') as f:
        data = csv.reader(f)
        data = [row for row in data]
    for i, _data in enumerate(data[1:]):
        ani_name, ani_title, ani_disc, ani_url, ani_wiki = _data
        aniinfo = AnimalInfo(animal_id=i, animal_name=ani_name, animal_title=ani_title, animal_disc=ani_disc, animal_url=ani_url, animal_wiki=ani_wiki)
        aniinfo.save()


# 画像ファイルUploadの際に使用
from django.conf import settings
from django.core.files.storage import FileSystemStorage
# 推論用モジュール
import numpy as np
import cv2
import chainer
import chainer.links as L
import chainer.functions as F
from chainer.links.model.vision.googlenet import prepare
from trained_model.trained_model import GoogleNetModel
from django.contrib.auth.decorators import login_required

# ログインに必要なモジュール
from .forms import SignUpForm
from django.contrib.auth import login, authenticate

# モデルの読み込みとラベルの定義（グローバル変数で読み込みましょう！）
model = L.Classifier(GoogleNetModel())
chainer.serializers.load_npz('trained_model/model_gnet_finetune.npz', model)



@login_required
def classify(request):
        # 画像データを取得＆保存
    if request.method == 'POST' and request.FILES['predict_img']:
        predict_img = request.FILES['predict_img']
        fs = FileSystemStorage()
        filename = fs.save(predict_img.name, predict_img)
        uploaded_file_url = fs.url(filename)

        #パスに日本語が入っているとエラー出るっぽい
        # HEIC対応するために　拡張子変換
        command = 'sips --setProperty format jpeg ' + uploaded_file_url + ' --out ' + uploaded_file_url.replace('.HEIC','.jpeg')
        subprocess.call(command, shell=True)
        uploaded_file_url = uploaded_file_url.replace('.HEIC','.jpeg')

        # 推論処理
        img = cv2.cvtColor(cv2.imread(uploaded_file_url), cv2.COLOR_BGR2RGB)
        x = prepare(img)
        y = model.predictor(np.array([x]))
        y_proba = F.softmax(y).data
        y_pre = np.argmax(y_proba, axis=1)[0]
        proba = round(y_proba[0][y_pre] * 100, 2)

        # AnimalInfoのDBから必要な情報の取得
        animal_info = AnimalInfo.objects.filter(animal_id=y_pre)

        # ZooCollectionに情報を保存
        current_user = request.user
        if not list(ZooCollection.objects.filter(user_id=current_user.id, animal_id=y_pre)):
            user_info = ZooCollection(user_id=current_user.id, animal_id=y_pre)
            user_info.save()

        return render(request, 'classify.html',
                {'uploaded_file_url': uploaded_file_url, 'animal_info': animal_info, 'proba': proba})
    return render(request, 'classify.html', {})

@login_required
def history(request):
    current_user = request.user
    collections = ZooCollection.objects.filter(user_id=current_user.id).order_by('animal_id').values_list('animal_id')
    if not collections:
        return render(request, 'history_nan.html', {})
    else:
        historys = []
        for id in collections:
            historys.append(AnimalInfo.objects.filter(animal_id=id[0]))
    return render(request, 'history.html', {'historys':historys})

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('/')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})