$(document).ready(function () {

    // 選択中のレコードid
    let selected = [];

    // DataTables 設定
    // https://datatables.net/reference/index
    let table = $('#datatable').dataTable({

        // Server-side processing:Ajaxモードの設定
        // https://datatables.net/examples/server_side/simple.html
        processing: true,
        serverSide: true,
        ajax: "Item",

        // dom: 検索フィールド等の各種ウィジェットの配置
        // https://datatables.net/reference/option/dom
        // dom: 'lfrtip',

       //  // ソート機能 無効
       //  order は [ [ 列番号, 昇順降順 ], ... ] の形式で指定します。
       // 列番号は0が1列目、1が2列目…です。
       // 昇順降順は 昇順 = "asc", 降順 = "desc" で指定します。
       //  「1行目昇順 + 2行目降順」としたい、というときは [ [ 0, "asc" ], [ 1, "desc"] ] になります。
        ordering: false,

        // lengthMenu: １ページに表示させる件数のリスト
        // https://datatables.net/reference/option/lengthMenu
        lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "全件"]],

         // 縦スクロールバーを有効にする (scrollYは200, "200px"など「最大の高さ」を指定します)
         scrollY: 200,


        // pageLength: pageLengthの初期値
        // https://datatables.net/reference/option/pageLength
        pageLength: 10,

        // language: 表示メッセージのローカライズ
        // https://datatables.net/reference/option/language
        // 日本語版ソース:https://github.com/DataTables/Plugins/blob/master/i18n/Japanese.lang
        language: {
            "thousands": ",",
            "sProcessing": "処理中...",
            "sLengthMenu": "_MENU_ 件",
            "sZeroRecords": "データはありません。",
            "sInfo": " _TOTAL_ 件中 _START_ ～ _END_ を表示",
            "sInfoEmpty": "データ無し",
            "sInfoFiltered": "（全 _MAX_ 件より抽出）",
            "sInfoPostFix": "",
            "sSearch": "検索:",
            "sUrl": "",
            "oPaginate": {
                "sFirst": "<<",
                "sPrevious": "<",
                "sNext": ">",
                "sLast": ">>"
            },
        },
        // rowCallback: 行の描画時に追加処理を行いたいときに使う。
        // https://datatables.net/reference/option/rowCallback

        // ページ遷移時に選択済みの行の表示を変更している。
        rowCallback: function (row, data) {
            $(row).attr('data-id', data[0]);
            if ($.inArray(data[0], selected) !== -1) {
                $(row).addClass('selected');
            }
        },

        // columns: 列の設定
        // https://datatables.net/reference/option/columns

        // 列の設定は 'columns' または 'columnDefs' で行う。
        // columns のほうが冗長な記述になるが視認性が良い気がする。

        // BaseDatatableViewのcolumnsの設定順にフィールドが列に割り当てられる。
        // columnsのフィールド数より列数が少ないとエラーになるので注意。

        // columnsと実際の列表示の内容を変更したい場合は以下のオプションで工面するとよい。

        // visible: bool    列の表示/非表示
        // data: number     違う列のデータを表示
        // render: function 関数でデータを加工

        // render内で他の列のデータを使うこともできる。
        // https://datatables.net/manual/data/renderers

        columns: [
            { targets: 0, data: "id" },
            { targets: 1, data: "item_name" },
            { targets: 3, data: "price" }
        ]
    });


    // server-side利用時は拡張機能の選択(Select)が使えないので、DataTables公式の
    // サンプルコードを元に選択処理を自作する。
    // https://datatables.net/examples/server_side/select_rows.html
    $('#datatable tbody').on('click', 'tr', function () {

        let id = $(this).attr('data-id');
        let index = $.inArray(id, selected);

        if (index === -1) {

            selected.push(id);
            selected.sort(function (a, b) {
                return a - b
            });
            $(this).addClass('selected');
        } else {
            selected.splice(index, 1);
            $(this).removeClass('selected');
        }
        $('#selected').html(selected.join(','));
    });

    // サンプル：クリックしたレコードのデータを取得
    // data()でセル、行、表示中のテーブル全体のデータを取得可能
    // https://datatables.net/reference/api/row().data()

    $('#datatable tbody').on('click', 'tr', function () {
        console.log(table.row(this).data());
    });

    // 全選択を解除
    $('#clear').on('click', function () {
        selected = [];
        $('#datatable tr').removeClass('selected');
        $('#selected').html(selected.join(','))
    })

    // 印刷・Excel・CSVボタン クリック
    $('.report').on('click', function () {

        if (selected.length == 0) {
            alert('先にデータを選択してください。');
            return false;
        }

        // 隠しフォームに選択したidを格納し、各機能のWebAPIに送信する
        let form = $("#form")[0];
        $("*[name=id_list]").val(selected.join('_'))
        form.method = 'GET';

        // GETクエリの長さ制限に注意。このコードは大量件数の選択に配慮していません。
        // https://support.microsoft.com/ja-jp/help/208427/maximum-url-length-is-2-083-characters-in-internet-explorer

        // ボタンのidで処理判定
        switch (this.id) {
            case
            'print':
                // 印刷のみ別ウィンドウを開く
                window.open('', 'new_window');
                form.action = 'print';
                form.target = 'new_window';
                form.submit();
                break;
            case
            'excel':
                form.action = 'excel';
                form.submit();
                break;
            case
            'csv':
                form.action = 'csv';
                form.submit();
                break;
        }
    })
});